import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getHistory, createVideoRoom, markConversationAsRead } from '../services/messagesService'
import {
  connectSocket,
  sendMessage as socketSendMessage,
  onNewMessage,
  requestCall,
} from '../services/socketService'
import {
  initiateFileTransfer,
  handleIncomingOffer,
  handleAnswer,
  handleIceCandidate,
  setFileReceiveHandler,
  closePeerConnection,
} from '../services/webrtcService'
import type { Message } from '../types/Message'

export function useChatViewModel(otherUserId: string) {
  const { token, user } = useAuth()
  const location = useLocation()
  const locationState = location.state as { username?: string; avatar?: string | null } | null
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [text, setText] = useState('')
  const [fileProgress, setFileProgress] = useState<number | null>(null)
  const [videoRoomUrl, setVideoRoomUrl] = useState<string | null>(null)
  const [incomingCall, setIncomingCall] = useState<{ fromUserId: string; roomUrl: string } | null>(null)
  const [callError, setCallError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load history
  useEffect(() => {
    if (!token) return
    setIsLoading(true)
    getHistory(token, otherUserId)
      .then(setMessages)
      .catch(() => null)
      .finally(() => setIsLoading(false))
  }, [token, otherUserId])

  // Mark conversation as read when chat is opened
  useEffect(() => {
    if (!token || !otherUserId) return
    markConversationAsRead(token, otherUserId).catch(() => null)
  }, [token, otherUserId])

  // Connect socket
  useEffect(() => {
    if (!token) return
    const socket = connectSocket(token)

    const unsubMsg = onNewMessage((msg) => {
      if (
        (msg.senderId === otherUserId && msg.receiverId === user?.id) ||
        (msg.senderId === user?.id && msg.receiverId === otherUserId)
      ) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === msg.id)
          return exists ? prev : [...prev, msg]
        })
      }
    })

    // WebRTC signaling listeners
    socket.on('webrtc_offer', async ({ fromUserId, data }: { fromUserId: string; data: RTCSessionDescriptionInit }) => {
      if (fromUserId === otherUserId) await handleIncomingOffer(fromUserId, data)
    })

    socket.on('webrtc_answer', async ({ data }: { data: RTCSessionDescriptionInit }) => {
      await handleAnswer(data)
    })

    socket.on('webrtc_ice_candidate', async ({ data }: { data: RTCIceCandidateInit }) => {
      await handleIceCandidate(data)
    })

    socket.on('incoming_call', (payload: { fromUserId: string; roomUrl: string }) => {
      setIncomingCall(payload)
    })

    socket.on('call_accepted', () => {
      // Room already open on caller side
    })

    socket.on('call_rejected', () => {
      setVideoRoomUrl(null)
      setCallError('Appel refusé')
    })

    return () => {
      unsubMsg()
      socket.off('webrtc_offer')
      socket.off('webrtc_answer')
      socket.off('webrtc_ice_candidate')
      socket.off('incoming_call')
      socket.off('call_accepted')
      socket.off('call_rejected')
    }
  }, [token, otherUserId, user?.id])

  // File receive handler
  useEffect(() => {
    setFileReceiveHandler((fileName, blob) => {
      const url = URL.createObjectURL(blob)
      // Show as a fake message in UI
      const fakeMsg: Message = {
        id: crypto.randomUUID(),
        senderId: otherUserId,
        receiverId: user?.id ?? '',
        content: url,
        type: 'file',
        fileName,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, fakeMsg])
    })
  }, [otherUserId, user?.id])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendText = useCallback(() => {
    if (!text.trim()) return
    socketSendMessage(otherUserId, text.trim())
    setText('')
  }, [text, otherUserId])

  const sendFile = useCallback(
    async (file: File) => {
      setFileProgress(0)
      try {
        await initiateFileTransfer(otherUserId, file, setFileProgress)
      } finally {
        setFileProgress(null)
        closePeerConnection()
      }
    },
    [otherUserId],
  )

  const startVideoCall = useCallback(async () => {
    if (!token) return
    setCallError(null)
    try {
      const { url } = await createVideoRoom(token)
      setVideoRoomUrl(url)
      requestCall(otherUserId, url)
    } catch {
      setCallError('Impossible de créer la room vidéo')
    }
  }, [token, otherUserId])

  const closeVideoCall = useCallback(() => {
    setVideoRoomUrl(null)
    setIncomingCall(null)
  }, [])

  const acceptIncomingCall = useCallback(() => {
    if (!incomingCall) return
    setVideoRoomUrl(incomingCall.roomUrl)
    setIncomingCall(null)
  }, [incomingCall])

  const rejectIncomingCall = useCallback(() => {
    setIncomingCall(null)
  }, [])

  return {
    messages,
    isLoading,
    text,
    setText,
    sendText,
    sendFile,
    fileProgress,
    videoRoomUrl,
    incomingCall,
    callError,
    startVideoCall,
    closeVideoCall,
    acceptIncomingCall,
    rejectIncomingCall,
    bottomRef,
    currentUserId: user?.id ?? '',
    otherUsername: locationState?.username ?? null,
    otherAvatar: locationState?.avatar ?? null,
  }
}
