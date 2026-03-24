import { useEffect, useState } from 'react'

type Props = Readonly<{
  calleeName: string | null
  calleeAvatar: string | null
  onCancel: () => void
}>

function CallerWaitingOverlay({ calleeName, calleeAvatar, onCancel }: Props) {
  const [dots, setDots] = useState('')
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setElapsed((prev) => prev + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (s: number): string =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 max-w-xs text-center">

        {/* Avatar avec rings animés */}
        <div className="relative">
          <div
            className="absolute -inset-4 rounded-full border border-[#00AFF0]/20 animate-ping"
            style={{ animationDuration: '2s' }}
          />
          <div
            className="absolute -inset-2 rounded-full border border-[#00AFF0]/30 animate-ping"
            style={{ animationDuration: '1.5s' }}
          />
          <div className="absolute -inset-0.5 rounded-full border-2 border-[#00AFF0]/50" />

          {calleeAvatar ? (
            <img
              src={calleeAvatar}
              alt=""
              className="w-20 h-20 rounded-full object-cover relative z-10"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#1a1a1a] flex items-center justify-center relative z-10 border border-[#2a2a2a]">
              <span className="text-2xl font-bold text-[#00AFF0]">
                {calleeName?.charAt(0).toUpperCase() ?? '?'}
              </span>
            </div>
          )}
        </div>

        {/* Statut */}
        <div>
          <p className="text-white font-semibold text-lg">
            {calleeName ? `@${calleeName}` : 'Appel en cours'}
          </p>
          <p className="text-[#8a8a8a] text-sm mt-1">
            En attente de réponse{dots}
          </p>
          <p className="text-[#8a8a8a]/60 text-xs mt-2 tabular-nums">
            {formatTime(elapsed)}
          </p>
        </div>

        {/* Bouton annuler */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={onCancel}
            className="
              w-14 h-14 rounded-full
              bg-red-500/15 hover:bg-red-500/25
              border border-red-500/30 hover:border-red-500/50
              flex items-center justify-center
              transition-all duration-150 active:scale-95
              group
            "
            aria-label="Annuler l'appel"
          >
            <svg
              className="w-6 h-6 text-red-400 group-hover:text-red-300 transition-colors"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p className="text-[#8a8a8a] text-xs">Annuler</p>
        </div>
      </div>
    </div>
  )
}

export default CallerWaitingOverlay
