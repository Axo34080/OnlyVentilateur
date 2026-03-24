import { useCall } from '../context/CallContext'
import IncomingCallBanner from './IncomingCallBanner'
import CallerWaitingOverlay from './CallerWaitingOverlay'
import VideoCallModal from './VideoCallModal'

function GlobalCallUI() {
  const {
    incomingCall,
    videoRoomUrl,
    callPending,
    calleeInfo,
    acceptIncomingCall,
    rejectIncomingCall,
    closeCall,
  } = useCall()

  return (
    <>
      {incomingCall && (
        <IncomingCallBanner
          callerUsername={incomingCall.callerUsername ?? null}
          onAccept={acceptIncomingCall}
          onReject={rejectIncomingCall}
        />
      )}
      {videoRoomUrl && callPending && (
        <CallerWaitingOverlay
          calleeName={calleeInfo?.name ?? null}
          calleeAvatar={calleeInfo?.avatar ?? null}
          onCancel={closeCall}
        />
      )}
      {videoRoomUrl && !callPending && (
        <VideoCallModal
          roomUrl={videoRoomUrl}
          onClose={closeCall}
        />
      )}
    </>
  )
}

export default GlobalCallUI
