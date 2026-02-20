import type { ReactNode } from "react"

interface Props {
  isLocked: boolean
  children: ReactNode
}

function PremiumBlur({ isLocked, children }: Props) {
  if (!isLocked) return <>{children}</>

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-xl gap-2">
        <span className="text-2xl">🔒</span>
        <span className="text-white text-sm font-semibold">Contenu premium</span>
      </div>
    </div>
  )
}

export default PremiumBlur
