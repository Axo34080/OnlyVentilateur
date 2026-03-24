import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'
import { connectSocket, requestCall, acceptCall, rejectCall } from '../services/socketService'
import { createVideoRoom } from '../services/messagesService'

interface IncomingCall {
  fromUserId: string
  roomUrl: string
  callerUsername?: string
}

interface CalleeInfo {
  name: string | null
  avatar: string | null
}

interface CallContextType {
  incomingCall: IncomingCall | null
  videoRoomUrl: string | null
  callPending: boolean
  calleeInfo: CalleeInfo | null
  startCall: (targetUserId: string, calleeName: string | null, calleeAvatar: string | null) => Promise<void>
  acceptIncomingCall: () => void
  rejectIncomingCall: () => void
  closeCall: () => void
}

const CallContext = createContext<CallContextType | null>(null)

export function CallProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { token } = useAuth()
  const { showToast } = useToast()

  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null)
  const [videoRoomUrl, setVideoRoomUrl] = useState<string | null>(null)
  const [callPending, setCallPending] = useState(false)
  const [calleeInfo, setCalleeInfo] = useState<CalleeInfo | null>(null)

  useEffect(() => {
    if (!token) return
    const socket = connectSocket(token)

    const onIncomingCall = (payload: IncomingCall) => setIncomingCall(payload)
    const onCallAccepted = () => setCallPending(false)
    const onCallRejected = () => {
      setCallPending(false)
      setVideoRoomUrl(null)
      setCalleeInfo(null)
      showToast("Appel refusé", 'error')
    }
    const onCallBlocked = () => {
      setCallPending(false)
      setVideoRoomUrl(null)
      setCalleeInfo(null)
      showToast("Cet utilisateur n'accepte pas les appels vidéo", 'error')
    }

    socket.on('incoming_call', onIncomingCall)
    socket.on('call_accepted', onCallAccepted)
    socket.on('call_rejected', onCallRejected)
    socket.on('call_blocked', onCallBlocked)

    return () => {
      socket.off('incoming_call', onIncomingCall)
      socket.off('call_accepted', onCallAccepted)
      socket.off('call_rejected', onCallRejected)
      socket.off('call_blocked', onCallBlocked)
    }
  }, [token, showToast])

  const startCall = useCallback(async (
    targetUserId: string,
    calleeName: string | null,
    calleeAvatar: string | null,
  ) => {
    if (!token) return
    try {
      const { url } = await createVideoRoom(token)
      setVideoRoomUrl(url)
      setCallPending(true)
      setCalleeInfo({ name: calleeName, avatar: calleeAvatar })
      requestCall(targetUserId, url)
    } catch {
      showToast('Impossible de créer la room vidéo', 'error')
    }
  }, [token, showToast])

  const acceptIncomingCall = useCallback(() => {
    if (!incomingCall) return
    acceptCall(incomingCall.fromUserId)
    setVideoRoomUrl(incomingCall.roomUrl)
    setIncomingCall(null)
  }, [incomingCall])

  const rejectIncomingCall = useCallback(() => {
    if (!incomingCall) return
    rejectCall(incomingCall.fromUserId)
    setIncomingCall(null)
  }, [incomingCall])

  const closeCall = useCallback(() => {
    setVideoRoomUrl(null)
    setCallPending(false)
    setIncomingCall(null)
    setCalleeInfo(null)
  }, [])

  const contextValue = useMemo(() => ({
    incomingCall,
    videoRoomUrl,
    callPending,
    calleeInfo,
    startCall,
    acceptIncomingCall,
    rejectIncomingCall,
    closeCall,
  }), [incomingCall, videoRoomUrl, callPending, calleeInfo, startCall, acceptIncomingCall, rejectIncomingCall, closeCall])

  return (
    <CallContext.Provider value={contextValue}>
      {children}
    </CallContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCall(): CallContextType {
  const ctx = useContext(CallContext)
  if (!ctx) throw new Error('useCall doit être utilisé dans un CallProvider')
  return ctx
}
