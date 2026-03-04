import { useToast } from "../context/ToastContext"

const styles = {
  success: "bg-green-600",
  error: "bg-red-600",
  info: "bg-slate-800",
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles[toast.type]} text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[220px] max-w-xs animate-fade-in`}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/70 hover:text-white transition-colors shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
