import { createContext, useCallback, useContext, useMemo, useState } from "react"
import type { ReactNode } from "react"

interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info"
}

interface ToastContextType {
  showToast: (message: string, type?: Toast["type"]) => void
  toasts: Toast[]
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), 3000)
  }, [removeToast])

  const contextValue = useMemo(
    () => ({ showToast, toasts, removeToast }),
    [showToast, toasts, removeToast]
  )

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used inside ToastProvider")
  return ctx
}
