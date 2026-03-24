import { useEffect, useState } from 'react'

type Props = Readonly<{
  callerUsername: string | null
  onAccept: () => void
  onReject: () => void
}>

function IncomingCallBanner({ callerUsername, onAccept, onReject }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      role="alertdialog"
      aria-label="Appel vidéo entrant"
      className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-[60]
        w-[min(400px,calc(100vw-2rem))]
        transition-all duration-300 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
      `}
    >
      {/* Glow derrière la card */}
      <div className="absolute -inset-1 rounded-3xl bg-[#00AFF0]/20 blur-xl animate-pulse" />

      {/* Card */}
      <div className="
        relative bg-[#111]/95 backdrop-blur-xl
        border border-[#2a2a2a] rounded-2xl
        px-5 py-4
        shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_0_1px_rgba(0,175,240,0.1)]
      ">
        <div className="flex items-center gap-3 mb-4">
          {/* Icône avec ring animé */}
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-full border-2 border-[#00AFF0]/60 animate-ping" />
            <div className="absolute -inset-1 rounded-full border-2 border-[#00AFF0]/30" />
            <div className="w-11 h-11 rounded-full bg-[#00AFF0]/15 flex items-center justify-center relative z-10">
              <svg className="w-5 h-5 text-[#00AFF0]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
          </div>

          <div>
            <p className="text-[13px] text-[#00AFF0] font-semibold uppercase tracking-wider">
              Appel vidéo entrant
            </p>
            <p className="text-white font-semibold text-base">
              {callerUsername ? `@${callerUsername}` : 'Quelqu\'un vous appelle'}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onReject}
            className="
              flex-1 flex items-center justify-center gap-2
              bg-red-500/15 hover:bg-red-500/25
              text-red-400 hover:text-red-300
              border border-red-500/20 hover:border-red-500/40
              rounded-xl py-2.5 text-sm font-semibold
              transition-all duration-150 active:scale-[0.97]
            "
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Refuser
          </button>
          <button
            onClick={onAccept}
            className="
              flex-1 flex items-center justify-center gap-2
              bg-emerald-500/15 hover:bg-emerald-500/25
              text-emerald-400 hover:text-emerald-300
              border border-emerald-500/20 hover:border-emerald-500/40
              rounded-xl py-2.5 text-sm font-semibold
              transition-all duration-150 active:scale-[0.97]
            "
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            Accepter
          </button>
        </div>
      </div>
    </div>
  )
}

export default IncomingCallBanner
