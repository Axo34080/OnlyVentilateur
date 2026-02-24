import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { getSubscribedCreators } from "../services/subscriptionService"
import CreatorCard from "../components/CreatorCard"
import type { Creator } from "../types/Creator"

function Subscriptions() {
  const { token } = useAuth()
  const [creators, setCreators] = useState<Creator[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    getSubscribedCreators(token)
      .then(setCreators)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [token])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Mes abonnements</h1>
        <p className="text-slate-500 mt-1">
          {isLoading ? "Chargement..." : `${creators.length} abonnement${creators.length > 1 ? "s" : ""} actif${creators.length > 1 ? "s" : ""}`}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 h-64 animate-pulse" />
          ))}
        </div>
      ) : creators.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-4">
          <div className="text-5xl">🌀</div>
          <div className="text-lg font-semibold text-slate-700">Aucun abonnement pour l'instant</div>
          <p className="text-slate-400 text-sm">Découvre nos créateurs et abonne-toi à tes ventilateurs préférés !</p>
          <Link
            to="/creators"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            Voir les créateurs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {creators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Subscriptions
