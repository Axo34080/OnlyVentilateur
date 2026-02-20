import type { User } from "../types/User"

interface AuthResponse {
  access_token: string
  user: Omit<User, "subscribedTo">
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error("Email ou mot de passe incorrect")
  return res.json()
}

export async function signup(
  email: string,
  username: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch("/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username, password }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.message ?? "Erreur lors de la création du compte")
  }
  return res.json()
}
