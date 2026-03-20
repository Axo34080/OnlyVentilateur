import { useState } from "react"
import { Link, useNavigate, Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function Signup() {
  const { signup, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/feed" replace />

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await signup(email, username, password)
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
          <p className="text-[#8a8a8a] mt-2">Rejoins la communauté ventilateur.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-[#8a8a8a] mb-1">Email</label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="turbo@ventilateur.fr"
              className="w-full px-4 py-2.5 rounded-lg border border-[#2a2a2a] bg-[#111] focus:outline-none focus:ring-2 focus:ring-[#00AFF0] text-white placeholder-[#555]"
            />
          </div>

          <div>
            <label htmlFor="signup-username" className="block text-sm font-medium text-[#8a8a8a] mb-1">Nom d'utilisateur</label>
            <input
              id="signup-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              placeholder="TurboFan2000"
              className="w-full px-4 py-2.5 rounded-lg border border-[#2a2a2a] bg-[#111] focus:outline-none focus:ring-2 focus:ring-[#00AFF0] text-white placeholder-[#555]"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-[#8a8a8a] mb-1">Mot de passe</label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
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
            {isLoading ? "Création..." : "Créer un compte"}
          </button>
        </form>

        <p className="text-center text-sm text-[#8a8a8a] mt-6">
          Déjà un compte ?{" "}
          <Link to="/login" className="text-[#00AFF0] hover:underline font-medium">
            Se connecter
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Signup
