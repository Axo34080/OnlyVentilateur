import DailyIframe from '@daily-co/daily-js'
import { useEffect, useRef } from 'react'

type Props = Readonly<{
  roomUrl: string
  onClose: () => void
}>

function VideoCallModal({ roomUrl, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const callFrameRef = useRef<ReturnType<typeof DailyIframe.createFrame> | null>(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose })

  useEffect(() => {
    if (!containerRef.current) return

    callFrameRef.current = DailyIframe.createFrame(containerRef.current, {
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: '16px',
      },
      showLeaveButton: true,
      showFullscreenButton: true,
    })

    callFrameRef.current.join({ url: roomUrl }).catch(() => null)

    callFrameRef.current.on('left-meeting', () => onCloseRef.current())

    return () => {
      callFrameRef.current?.destroy()
      callFrameRef.current = null
    }
  }, [roomUrl])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="relative w-full max-w-3xl h-[70vh] bg-black rounded-2xl overflow-hidden shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 text-white bg-black/50 hover:bg-black/80 rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors"
          aria-label="Fermer l'appel"
        >
          ✕
        </button>
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  )
}

export default VideoCallModal
