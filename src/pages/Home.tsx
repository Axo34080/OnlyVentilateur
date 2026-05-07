import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import CreatorCard from "../components/CreatorCard"
import { useAuth } from "../context/AuthContext"
import { getCreators } from "../services/creatorsService"
import type { Creator } from "../types/Creator"

const pitchCards = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: "Contenu Haute Pression",
    desc: "Posts floutés pour les non-abonnés. Le souffle, ça se mérite.",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "Abonnement sécurisé",
    desc: "Paiement sécurisé. Accès immédiat. Annulation à tout moment.",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.732l3.181 3.183m0-4.991v4.99" />
      </svg>
    ),
    title: "Les meilleurs Ventilateurs",
    desc: "Des centaines de Ventilateurs certifiés. Brise légère, Tempête ou Ouragan.",
  },
]

function Home() {
  const { isAuthenticated } = useAuth()
  const [featuredCreators, setFeaturedCreators] = useState<Creator[]>([])
  const [featuredError, setFeaturedError] = useState<string | null>(null)

  useEffect(() => {
    getCreators()
      .then((all) => setFeaturedCreators(all.slice(0, 4)))
      .catch(() => setFeaturedError("Impossible de charger les Ventilateurs populaires."))
  }, [])

  return (
    <div className="flex flex-col gap-16">

      {/* Hero */}
      <section className="flex flex-col items-center text-center py-16 gap-6">
        <img
          src="/image_2026-03-10_110143029-removebg-preview.png"
          alt="Logo OnlyVentilateurs"
          className="h-24 w-24 object-contain"
        />
        <h1 className="text-6xl font-bold text-white tracking-tight">
          Only<span className="text-[#00AFF0]">Ventilateurs</span>
        </h1>
        <p className="text-xl text-[#8a8a8a] max-w-lg">
          La seule plateforme où le contenu souffle vraiment fort.
          Abonnez-vous aux meilleurs Ventilateurs du web.
        </p>
        <div className="flex gap-3">
          {!isAuthenticated && (
            <Link
              to="/signup"
              className="bg-[#00AFF0] hover:bg-[#0099CC] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Recevoir le souffle
            </Link>
          )}
          <Link
            to="/creators"
            className="bg-transparent hover:bg-white/5 text-white font-semibold px-6 py-3 rounded-xl border border-[#2a2a2a] transition-colors"
          >
            Découvrir les Ventilateurs
          </Link>
        </div>
      </section>

      {/* Créateurs vedettes */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Ventilateurs populaires
          </h2>
          <Link to="/creators" className="text-sm text-[#00AFF0] hover:underline">
            Tous les Ventilateurs →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredError && (
            <p className="text-sm text-red-400 sm:col-span-2 lg:col-span-4">{featuredError}</p>
          )}
          {featuredCreators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      </section>

      {/* Pitch */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-8">
        {pitchCards.map(({ icon, title, desc }) => (
          <div key={title} className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6 text-center flex flex-col items-center gap-3">
            <div className="text-[#00AFF0]">{icon}</div>
            <h3 className="font-bold text-white">{title}</h3>
            <p className="text-sm text-[#8a8a8a]">{desc}</p>
          </div>
        ))}
      </section>

    </div>
  )
}

export default Home
