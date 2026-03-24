type Props = Readonly<{
  roomUrl: string
  onClose: () => void
}>

function VideoCallModal({ roomUrl, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="relative w-full max-w-4xl h-[80vh] bg-black rounded-2xl overflow-hidden shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 text-white bg-black/50 hover:bg-black/80 rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors"
          aria-label="Fermer l'appel"
        >
          ✕
        </button>
        <iframe
          src={roomUrl}
          allow="camera; microphone; fullscreen; display-capture"
          className="w-full h-full"
          style={{ border: 'none' }}
          title="Appel vidéo"
        />
      </div>
    </div>
  )
}

export default VideoCallModal
