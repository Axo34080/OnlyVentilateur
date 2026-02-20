import { useParams, Navigate } from "react-router-dom"
import { useCreatorProfileViewModel } from "../ViewModels/useCreatorProfileViewModel"
import PostCard from "../components/PostCard"

function CreatorProfile() {
  const { id } = useParams<{ id: string }>()
  const { creator, posts, isSubscribed, isLoading, error, handleSubscribe, handleLike } =
    useCreatorProfileViewModel(id ?? "")

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="text-slate-400 text-sm animate-pulse">Chargement...</div>
      </div>
    )
  }

  if (error || !creator) return <Navigate to="/creators" replace />

  return (
    <div className="flex flex-col gap-8">

      {/* Bannière */}
      <div className="relative">
        <div className="rounded-2xl overflow-hidden">
          <img
            src={creator.coverImage}
            alt=""
            className="w-full h-48 object-cover"
          />
        </div>
        {/* Avatar flottant */}
        <div className="absolute -bottom-10 left-6">
          <img
            src={creator.avatar}
            alt={creator.displayName}
            className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md"
          />
        </div>
      </div>

      {/* Infos créateur */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-6 px-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">{creator.displayName}</h1>
            {creator.isPremium && (
              <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                ⭐ Premium
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm">{creator.username}</p>
          <p className="text-slate-600 mt-2 max-w-xl">{creator.bio}</p>

          <div className="flex gap-6 mt-3 text-sm text-slate-500">
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
        </div>

        {/* Bouton abonnement */}
        <div className="flex flex-col items-start sm:items-end gap-1">
          <button
            onClick={handleSubscribe}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
              isSubscribed
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isSubscribed ? "✓ Abonné" : `S'abonner — ${creator.subscriptionPrice.toFixed(2)} €/mois`}
          </button>
          {isSubscribed && (
            <span className="text-xs text-slate-400">Accès à tout le contenu premium</span>
          )}
        </div>
      </div>

      {/* Posts */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-slate-900">
          Publications ({posts.length})
        </h2>
        {posts.length === 0 ? (
          <p className="text-slate-400 text-sm">Aucune publication pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isSubscribed={isSubscribed}
                onLike={handleLike}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default CreatorProfile
