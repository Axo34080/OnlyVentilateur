import { Link } from "react-router-dom"
import type { Creator } from "../types/Creator"

type Props = Readonly<{
  creator: Creator
}>

function CreatorCard({ creator }: Props) {
  return (
    <Link
      to={`/creators/${creator.id}`}
      className="block bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] shadow-sm overflow-hidden hover:border-[#00AFF0]/30 transition-colors"
    >

      {/* Cover */}
      <div className="h-24 bg-[#111] overflow-hidden">
        <img
          src={creator.coverImage}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* Avatar + badges */}
      <div className="px-4 pb-4">
        <div className="flex items-end justify-between -mt-8 mb-3">
          {creator.avatar ? (
            <img
              src={creator.avatar}
              alt={creator.displayName}
              className="w-16 h-16 rounded-full border-4 border-[#1a1a1a] object-cover shadow-sm"
            />
          ) : (
            <div className="w-16 h-16 rounded-full border-4 border-[#1a1a1a] flex items-center justify-center shadow-sm" style={{ backgroundColor: '#00AFF0' }}>
              <span className="text-white font-bold text-xl">{creator.displayName.charAt(0).toUpperCase()}</span>
            </div>
          )}
          {creator.isPremium && (
            <span className="text-xs font-semibold bg-[#00AFF0]/10 text-[#00AFF0] px-2 py-1 rounded-full">
              Turbo
            </span>
          )}
        </div>

        {/* Nom + username */}
        <h3 className="font-bold text-white text-base leading-tight">
          {creator.displayName}
        </h3>
        <p className="text-sm text-[#8a8a8a] mb-2">{creator.username}</p>

        {/* Bio */}
        <p className="text-sm text-[#8a8a8a] line-clamp-2 mb-4">{creator.bio}</p>

        {/* Stats */}
        <div className="flex gap-4 text-sm text-[#8a8a8a] mb-4">
          <span>
            <span className="font-semibold text-white">
              {(creator.subscriberCount ?? 0).toLocaleString("fr-FR")}
            </span>{" "}
            souffleurs
          </span>
          <span>
            <span className="font-semibold text-white">{creator.postCount ?? 0}</span>{" "}
            rafales
          </span>
        </div>

        {/* Prix */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[#00AFF0]">
            {creator.subscriptionPrice.toFixed(2)} €<span className="font-normal text-[#8a8a8a]"> souffle/mois</span>
          </span>
          <span className="text-sm text-[#00AFF0] font-medium">Sentir le souffle →</span>
        </div>
      </div>

    </Link>
  )
}

export default CreatorCard
