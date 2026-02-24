import { useState } from "react"
import { useParams, Navigate } from "react-router-dom"
import { useCreatorProfileViewModel } from "../ViewModels/useCreatorProfileViewModel"
import PostCard from "../components/PostCard"

function CreatorProfile() {
  const { id } = useParams<{ id: string }>()
  const { creator, posts, isSubscribed, isCheckingSubscription, isLoading, error, handleSubscribe, handleLike, isPostLiked } =
    useCreatorProfileViewModel(id ?? "")
  const [activeTab, setActiveTab] = useState<"posts" | "about">("posts")

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
            disabled={isCheckingSubscription}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 ${
              isSubscribed
                ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isCheckingSubscription
              ? "..."
              : isSubscribed
              ? "Se désabonner"
              : `S'abonner — ${creator.subscriptionPrice.toFixed(2)} €/mois`}
          </button>
          {isSubscribed && !isCheckingSubscription && (
            <span className="text-xs text-slate-400">Accès à tout le contenu premium</span>
          )}
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-slate-200 flex gap-0">
        {(["posts", "about"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab === "posts" ? `Publications (${posts.length})` : "À propos"}
          </button>
        ))}
      </div>

      {/* Contenu onglet */}
      {activeTab === "posts" ? (
        posts.length === 0 ? (
          <p className="text-slate-400 text-sm">Aucune publication pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isSubscribed={isSubscribed}
                isLiked={isPostLiked(post.id)}
                onLike={handleLike}
              />
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col gap-6 max-w-xl">
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">Bio</h3>
            <p className="text-slate-700">{creator.bio}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Statistiques</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-slate-900">{(creator.subscriberCount ?? 0).toLocaleString("fr-FR")}</div>
                <div className="text-xs text-slate-500 mt-1">Abonnés</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-slate-900">{creator.postCount ?? 0}</div>
                <div className="text-xs text-slate-500 mt-1">Publications</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-slate-900">{creator.subscriptionPrice.toFixed(2)} €</div>
                <div className="text-xs text-slate-500 mt-1">/ mois</div>
              </div>
            </div>
          </div>
          {creator.isPremium && (
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 rounded-xl px-4 py-3 text-sm font-medium">
              ⭐ Créateur Premium — contenu exclusif réservé aux abonnés
            </div>
          )}
        </div>
      )}

    </div>
  )
}

export default CreatorProfile
