import { useState, useEffect } from "react"
import CreatorCard from "../components/CreatorCard"
import { getCreators } from "../services/creatorsService"
import type { Creator } from "../types/Creator"

function Creators() {
  const [creators, setCreators] = useState<Creator[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getCreators()
      .then(setCreators)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Tous les créateurs</h1>
        <p className="text-slate-500 mt-1">
          {isLoading ? "Chargement..." : `${creators.length} créateurs disponibles`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 h-64 animate-pulse" />
            ))
          : creators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
      </div>
    </div>
  )
}

export default Creators
