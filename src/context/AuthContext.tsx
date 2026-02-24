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

const SESSION_KEY = "ov_session"

function loadSession(): { user: User; token: string } | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const saved = loadSession()
  const [user, setUser] = useState<User | null>(saved?.user ?? null)
  const [token, setToken] = useState<string | null>(saved?.token ?? null)

  const persist = (u: User, t: string) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user: u, token: t }))
  }

  const login = async (email: string, password: string): Promise<void> => {
    const data = await authService.login(email, password)
    const u: User = { ...data.user, subscribedTo: [] }
    setToken(data.access_token)
    setUser(u)
    persist(u, data.access_token)
  }

  const signup = async (email: string, username: string, password: string): Promise<void> => {
    const data = await authService.signup(email, username, password)
    const u: User = { ...data.user, subscribedTo: [] }
    setToken(data.access_token)
    setUser(u)
    persist(u, data.access_token)
  }

  const logout = (): void => {
    setUser(null)
    setToken(null)
    sessionStorage.removeItem(SESSION_KEY)
  }

  const updateUser = (data: Partial<Omit<User, "id" | "email" | "subscribedTo">>): void => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, ...data }
      if (token) persist(updated, token)
      return updated
    })
  }

  return (
    <AuthContext.Provider
      value={{ user, token, login, signup, logout, updateUser, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider")
  return ctx
}
