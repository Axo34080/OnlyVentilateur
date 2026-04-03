import { Navigate } from "react-router-dom"
import type { ReactNode } from "react"
import { useAuth } from "../context/AuthContext"

type Props = Readonly<{
  children: ReactNode
}>

/**
 * PRÉSENTATION — ProtectedRoute
 *
 * Composant wrapper qui protège les routes réservées aux utilisateurs connectés.
 * Consomme AuthContext via useAuth() → si non connecté, redirige vers /login.
 * Utilisé dans App.tsx : <ProtectedRoute><Dashboard /></ProtectedRoute>
 */
function ProtectedRoute({ children }: Props) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default ProtectedRoute
