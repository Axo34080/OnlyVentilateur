import type { ReactNode } from "react"

type Props = Readonly<{
  isLocked: boolean
  children: ReactNode
}>

function PremiumBlur({ isLocked, children }: Props) {
  if (!isLocked) return <>{children}</>

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none rounded-xl overflow-hidden">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-xl gap-2">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        <span className="text-white text-sm font-semibold">Contenu Haute Pression</span>
      </div>
    </div>
  )
}

export default PremiumBlur
