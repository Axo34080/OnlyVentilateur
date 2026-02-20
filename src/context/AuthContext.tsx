import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"
import * as authService from "../services/authService"
import type { User } from "../types/User"

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, username: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<Omit<User, "id" | "email" | "subscribedTo">>) => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  const login = async (email: string, password: string): Promise<void> => {
    const data = await authService.login(email, password)
    setToken(data.access_token)
    setUser({ ...data.user, subscribedTo: [] })
  }

  const signup = async (email: string, username: string, password: string): Promise<void> => {
    const data = await authService.signup(email, username, password)
    setToken(data.access_token)
    setUser({ ...data.user, subscribedTo: [] })
  }

  const logout = (): void => {
    setUser(null)
    setToken(null)
  }

  const updateUser = (data: Partial<Omit<User, "id" | "email" | "subscribedTo">>): void => {
    setUser((prev) => (prev ? { ...prev, ...data } : prev))
  }

  return (
    <AuthContext.Provider
      value={{ user, token, login, signup, logout, updateUser, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider")
  return ctx
}
