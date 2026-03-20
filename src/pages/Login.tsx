import { useState } from "react"
import { Link, useNavigate, Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function Login() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/feed" replace />

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await login(email, password)
      navigate("/feed")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md bg-[#1a1a1a] rounded-2xl shadow-sm border border-[#2a2a2a] p-8">

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-1">
            <img src="/image_2026-03-10_110143029-removebg-preview.png" alt="" className="h-10 w-10 object-contain" />
            <h1 className="text-3xl font-bold text-white">OnlyVentilateur</h1>
          </div>
          <p className="text-[#8a8a8a] mt-2">Content de te revoir, souffleur.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-[#8a8a8a] mb-1">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="turbo@ventilateur.fr"
              className="w-full px-4 py-2.5 rounded-lg border border-[#2a2a2a] bg-[#111] focus:outline-none focus:ring-2 focus:ring-[#00AFF0] text-white placeholder-[#555]"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-[#8a8a8a] mb-1">Mot de passe</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-[#2a2a2a] bg-[#111] focus:outline-none focus:ring-2 focus:ring-[#00AFF0] text-white placeholder-[#555]"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-900/20 px-4 py-2.5 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#00AFF0] hover:bg-[#0099CC] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-sm text-[#8a8a8a] mt-6">
          Pas encore de compte ?{" "}
          <Link to="/signup" className="text-[#00AFF0] hover:underline font-medium">
            S'inscrire
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Login
