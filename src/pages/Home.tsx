import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import CreatorCard from "../components/CreatorCard"
import { useAuth } from "../context/AuthContext"
import { getCreators } from "../services/creatorsService"
import type { Creator } from "../types/Creator"

function Home() {
  const { isAuthenticated } = useAuth()
  const [featuredCreators, setFeaturedCreators] = useState<Creator[]>([])

  useEffect(() => {
    getCreators()
      .then((all) => setFeaturedCreators(all.slice(0, 4)))
      .catch(() => {})
  }, [])

  return (
    <div className="flex flex-col gap-16">

      {/* Hero */}
      <section className="flex flex-col items-center text-center py-16 gap-6">
        <img
          src="/image_2026-03-10_110143029-removebg-preview.png"
          alt="Logo OnlyVentilateur"
          className="h-24 w-24 object-contain"
        />
        <h1 className="text-6xl font-bold text-slate-900">
          OnlyVentilateur
        </h1>
        <p className="text-xl text-slate-600 max-w-lg">
          La plateforme exclusive des créateurs de contenu ventilateur.
          Abonnez-vous aux meilleurs souffles du web.
        </p>
        <div className="flex gap-3">
          {!isAuthenticated && (
            <Link
              to="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Rejoindre
            </Link>
          )}
          <Link
            to="/creators"
            className="bg-white hover:bg-slate-50 text-slate-800 font-semibold px-6 py-3 rounded-xl border border-slate-200 transition-colors"
          >
            Découvrir les créateurs
          </Link>
        </div>
      </section>

      {/* Créateurs vedettes */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            Créateurs populaires
          </h2>
          <Link to="/creators" className="text-sm text-blue-600 hover:underline">
            Voir tous →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredCreators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      </section>

      {/* Pitch */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-8">
        {[
          { emoji: "💨", title: "Contenu exclusif", desc: "Posts premium floutés pour les non-abonnés. Le souffle, ça se mérite." },
          { emoji: "🔒", title: "Abonnement sécurisé", desc: "Paiement sécurisé. Accès immédiat. Annulation à tout moment." },
          { emoji: "🌀", title: "Les meilleurs créateurs", desc: "Des centaines de créateurs ventilateurs. Tous styles, toutes puissances." },
        ].map(({ emoji, title, desc }) => (
          <div key={title} className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
            <div className="text-4xl mb-3">{emoji}</div>
            <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-sm text-slate-500">{desc}</p>
          </div>
        ))}
      </section>

    </div>
  )
}

export default Home
