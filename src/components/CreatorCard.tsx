import { Link } from "react-router-dom"
import type { Creator } from "../types/Creator"

interface Props {
  creator: Creator
}

function CreatorCard({ creator }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">

      {/* Cover */}
      <div className="h-24 bg-slate-100 overflow-hidden">
        <img
          src={creator.coverImage}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* Avatar + badges */}
      <div className="px-4 pb-4">
        <div className="flex items-end justify-between -mt-8 mb-3">
          <img
            src={creator.avatar}
            alt={creator.displayName}
            className="w-16 h-16 rounded-full border-4 border-white object-cover shadow-sm"
          />
          {creator.isPremium && (
            <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
              ⭐ Premium
            </span>
          )}
        </div>

        {/* Nom + username */}
        <h3 className="font-bold text-slate-900 text-base leading-tight">
          {creator.displayName}
        </h3>
        <p className="text-sm text-slate-400 mb-2">{creator.username}</p>

        {/* Bio */}
        <p className="text-sm text-slate-600 line-clamp-2 mb-4">{creator.bio}</p>

        {/* Stats */}
        <div className="flex gap-4 text-sm text-slate-500 mb-4">
          <span>
            <span className="font-semibold text-slate-800">
              {(creator.subscriberCount ?? 0).toLocaleString("fr-FR")}
            </span>{" "}
            abonnés
          </span>
          <span>
            <span className="font-semibold text-slate-800">{creator.postCount ?? 0}</span>{" "}
            posts
          </span>
        </div>

        {/* Prix + CTA */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-blue-600">
            {creator.subscriptionPrice.toFixed(2)} €<span className="font-normal text-slate-400">/mois</span>
          </span>
          <Link
            to={`/creators/${creator.id}`}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-1.5 rounded-lg transition-colors"
          >
            Voir le profil
          </Link>
        </div>
      </div>

    </div>
  )
}

export default CreatorCard
