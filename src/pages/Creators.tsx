import { useState, useEffect } from "react"
import CreatorCard from "../components/CreatorCard"
import { getCreators } from "../services/creatorsService"
import type { Creator } from "../types/Creator"

function Creators() {
  const [creators, setCreators] = useState<Creator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    getCreators()
      .then(setCreators)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const filtered = creators.filter(
    (c) =>
      c.displayName.toLowerCase().includes(search.toLowerCase()) ||
      c.username.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tous les créateurs</h1>
          <p className="text-slate-500 mt-1">
            {isLoading
              ? "Chargement..."
              : `${filtered.length} créateur${filtered.length > 1 ? "s" : ""} disponible${filtered.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <input
          type="search"
          placeholder="Rechercher un créateur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 h-64 animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <p className="text-slate-400 text-sm col-span-3">Aucun créateur trouvé pour "{search}"</p>
        ) : (
          filtered.map((creator) => <CreatorCard key={creator.id} creator={creator} />)
        )}
      </div>
    </div>
  )
}

export default Creators
