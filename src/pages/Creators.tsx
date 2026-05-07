import { useState, useEffect } from "react"
import CreatorCard from "../components/CreatorCard"
import { getCreators } from "../services/creatorsService"
import type { Creator } from "../types/Creator"

function Creators() {
  const [creators, setCreators] = useState<Creator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    getCreators()
      .then(setCreators)
      .catch(() => setError("Impossible de charger les Ventilateurs."))
      .finally(() => setIsLoading(false))
  }, [])

  const filtered = creators.filter(
    (c) =>
      c.displayName.toLowerCase().includes(search.toLowerCase()) ||
      c.username.toLowerCase().includes(search.toLowerCase())
  )

  const pluralS = filtered.length > 1 ? "s" : ""
  const creatorCountLabel = isLoading
    ? "Chargement..."
    : `${filtered.length} Ventilateur${pluralS} disponible${pluralS}`

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">Tous les Ventilateurs</h1>
          <p className="text-[#8a8a8a] mt-1">
            {creatorCountLabel}
          </p>
        </div>
        <input
          type="search"
          placeholder="Rechercher un Ventilateur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-[#2a2a2a] bg-[#111] text-white placeholder-[#555] rounded-xl px-4 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#00AFF0]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && Array.from({ length: 6 }, (_, i) => `creator-sk-${i}`).map((key) => (
          <div key={key} className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] h-64 animate-pulse" />
        ))}
        {!isLoading && error && (
          <p className="text-red-400 text-sm col-span-3">{error}</p>
        )}
        {!isLoading && !error && filtered.length === 0 && (
          <p className="text-[#8a8a8a] text-sm col-span-3">Aucun Ventilateur trouvé pour "{search}"</p>
        )}
        {!isLoading && !error && filtered.length > 0 && filtered.map((creator) => (
          <CreatorCard key={creator.id} creator={creator} />
        ))}
      </div>
    </div>
  )
}

export default Creators
