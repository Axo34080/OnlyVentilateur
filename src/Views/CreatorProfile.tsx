import { useState } from "react"
import { useParams, Navigate, Link } from "react-router-dom"
import { useCreatorProfileViewModel } from "../ViewModels/useCreatorProfileViewModel"
import PostCard from "../components/PostCard"
import type { Creator } from "../types/Creator"
import type { Post } from "../types/Post"
import type { Goodie } from "../services/goodiesService"

type Tab = "posts" | "shop" | "about" | "subs"

// ── Sub-components ────────────────────────────────────────────────────────────

type ProfileButtonsProps = Readonly<{
  isOwnProfile: boolean
  creator: Creator
  isSubscribed: boolean
  isCheckingSubscription: boolean
  creatorUserId?: string
  handleSubscribe: () => Promise<void>
}>

function ProfileButtons({
  isOwnProfile, creator, isSubscribed, isCheckingSubscription, creatorUserId, handleSubscribe,
}: ProfileButtonsProps) {
  if (isOwnProfile) {
    return (
      <div className="flex gap-2">
        <Link
          to="/profile/edit"
          className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-[#2a2a2a] text-white hover:bg-[#333] transition-colors border border-[#3a3a3a]"
        >
          Modifier le profil
        </Link>
        <Link
          to="/dashboard"
          className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-[#00AFF0] text-white hover:bg-[#0099CC] transition-colors"
        >
          Gérer mon espace →
        </Link>
      </div>
    )
  }

  const subscribeLabelWhenLoaded = isSubscribed ? "Arrêter le souffle" : `Rejoindre les Souffleurs — ${creator.subscriptionPrice.toFixed(2)} €/mois`
  const subscribeLabel = isCheckingSubscription ? "..." : subscribeLabelWhenLoaded

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={handleSubscribe}
          disabled={isCheckingSubscription}
          className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 ${
            isSubscribed
              ? "bg-red-900/20 text-red-400 border border-red-800 hover:bg-red-900/30"
              : "bg-[#00AFF0] text-white hover:bg-[#0099CC]"
          }`}
        >
          {subscribeLabel}
        </button>
        {creatorUserId && (
          <Link
            to={`/messages/${creatorUserId}`}
            state={{ username: creator.username, avatar: creator.avatar || null }}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-[#2a2a2a] text-white hover:bg-[#333] transition-colors border border-[#3a3a3a]"
          >
            Message
          </Link>
        )}
      </div>
      {isSubscribed && !isCheckingSubscription && (
        <span className="text-xs text-[#8a8a8a]">Accès à tous les souffles premium</span>
      )}
    </>
  )
}

type PostsTabProps = Readonly<{
  posts: Post[]
  isSubscribed: boolean
  isOwnProfile: boolean
  isPostLiked: (id: string) => boolean
  handleLike: (id: string) => void
}>

function PostsTab({ posts, isSubscribed, isOwnProfile, isPostLiked, handleLike }: PostsTabProps) {
  if (posts.length === 0) {
    return <p className="text-[#8a8a8a] text-sm">Aucune rafale pour le moment.</p>
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          isSubscribed={isSubscribed || isOwnProfile}
          isLiked={isPostLiked(post.id)}
          onLike={handleLike}
        />
      ))}
    </div>
  )
}

function ShopTab({ goodies }: Readonly<{ goodies: Goodie[] }>) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {goodies.map((goodie) => (
        <Link
          key={goodie.id}
          to={`/shop/${goodie.id}`}
          className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] shadow-sm overflow-hidden hover:border-[#00AFF0]/30 transition-colors"
        >
          <img src={goodie.image} alt={goodie.name} className="w-full h-40 object-cover" />
          <div className="p-4 flex flex-col gap-1">
            <h3 className="font-semibold text-white text-sm leading-snug">{goodie.name}</h3>
            {goodie.description && (
              <p className="text-xs text-[#8a8a8a] line-clamp-2">{goodie.description}</p>
            )}
            <div className="flex items-center justify-between mt-2">
              <span className="font-bold text-[#00AFF0]">{Number(goodie.price).toFixed(2)} €</span>
              {!goodie.inStock && (
                <span className="text-xs text-[#8a8a8a] bg-[#2a2a2a] px-2 py-0.5 rounded-full">Rupture</span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

type SubsTabProps = Readonly<{
  subscriptions: Creator[]
  handleUnsubscribeFromCreator: (id: string) => Promise<void>
}>

function SubsTab({ subscriptions, handleUnsubscribeFromCreator }: SubsTabProps) {
  if (subscriptions.length === 0) {
    return <p className="text-sm text-[#8a8a8a]">{"Tu ne suis aucun Ventilateur pour l'instant."}</p>
  }
  return (
    <div className="flex flex-col gap-3">
      {subscriptions.map((sub) => (
        <div key={sub.id} className="flex items-center justify-between gap-3">
          <Link
            to={`/creators/${sub.id}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity min-w-0"
          >
            <img src={sub.avatar} alt={sub.displayName} className="w-10 h-10 rounded-full object-cover shrink-0" />
            <div className="min-w-0">
              <div className="font-semibold text-white text-sm truncate">{sub.displayName}</div>
              <div className="text-xs text-[#8a8a8a] truncate">{sub.username}</div>
            </div>
          </Link>
          <button
            onClick={() => handleUnsubscribeFromCreator(sub.id)}
            className="text-xs text-[#8a8a8a] hover:text-red-400 transition-colors shrink-0 border border-[#2a2a2a] hover:border-red-800 px-3 py-1.5 rounded-lg"
          >
            Arrêter le souffle
          </button>
        </div>
      ))}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

function CreatorProfile() {
  const { id } = useParams<{ id: string }>()
  const {
    creator, posts, goodies, isSubscribed, isCheckingSubscription, isLoading, error, isOwnProfile,
    subscriptions, handleUnsubscribeFromCreator, handleSubscribe, handleLike, isPostLiked,
  } = useCreatorProfileViewModel(id ?? "")

  const [activeTab, setActiveTab] = useState<Tab>("posts")

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="text-[#8a8a8a] text-sm animate-pulse">Chargement...</div>
      </div>
    )
  }

  if (error || !creator) return <Navigate to="/creators" replace />

  const tabs: { key: Tab; label: string }[] = [
    { key: "posts", label: `Rafales (${posts.length})` },
    ...(goodies.length > 0 ? [{ key: "shop" as Tab, label: `Boutique (${goodies.length})` }] : []),
    { key: "about", label: "À propos" },
    ...(isOwnProfile ? [{ key: "subs" as Tab, label: "Mes Ventilateurs suivis" }] : []),
  ]

  return (
    <div className="flex flex-col gap-8">

      {/* Bannière + avatar */}
      <div className="relative">
        <div className="rounded-2xl overflow-hidden">
          <img src={creator.coverImage} alt="" className="w-full h-48 object-cover" />
        </div>
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
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-white">{creator.displayName}</h1>
            {creator.isPremium && (
              <span className="text-xs font-semibold bg-[#00AFF0]/10 text-[#00AFF0] px-2 py-1 rounded-full">
                Turbo
              </span>
            )}
          </div>
          <p className="text-[#8a8a8a] text-sm mt-0.5">{creator.username}</p>
          <p className="text-[#8a8a8a] mt-2 max-w-xl">{creator.bio}</p>
          <div className="flex gap-6 mt-3 text-sm text-[#8a8a8a]">
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
        </div>

        {/* Boutons droite */}
        <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
          <ProfileButtons
            isOwnProfile={isOwnProfile}
            creator={creator}
            isSubscribed={isSubscribed}
            isCheckingSubscription={isCheckingSubscription}
            creatorUserId={creator.userId}
            handleSubscribe={handleSubscribe}
          />
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-[#2a2a2a] flex gap-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-[#00AFF0] text-[#00AFF0]"
                : "border-transparent text-[#8a8a8a] hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "posts" && (
        <PostsTab
          posts={posts}
          isSubscribed={isSubscribed}
          isOwnProfile={isOwnProfile}
          isPostLiked={isPostLiked}
          handleLike={handleLike}
        />
      )}

      {activeTab === "shop" && <ShopTab goodies={goodies} />}

      {/* Onglet À propos */}
      {activeTab === "about" && (
        <div className="flex flex-col gap-6 max-w-xl">
          <div>
            <h3 className="text-sm font-semibold text-[#555] uppercase tracking-wide mb-1">Bio</h3>
            <p className="text-[#8a8a8a]">{creator.bio}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#555] uppercase tracking-wide mb-3">Statistiques</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4 text-center">
                <div className="text-2xl font-bold text-white">{(creator.subscriberCount ?? 0).toLocaleString("fr-FR")}</div>
                <div className="text-xs text-[#555] mt-1">Souffleurs</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4 text-center">
                <div className="text-2xl font-bold text-white">{creator.postCount ?? 0}</div>
                <div className="text-xs text-[#555] mt-1">Rafales</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4 text-center">
                <div className="text-2xl font-bold text-white">{creator.subscriptionPrice.toFixed(2)} €</div>
                <div className="text-xs text-[#555] mt-1">/ mois</div>
              </div>
            </div>
          </div>
          {creator.isPremium && (
            <div className="flex items-center gap-2 text-[#00AFF0] bg-[#00AFF0]/10 rounded-xl px-4 py-3 text-sm font-medium">
              Ventilateur Turbo — souffle exclusif réservé aux Souffleurs
            </div>
          )}
        </div>
      )}

      {activeTab === "subs" && isOwnProfile && (
        <div className="max-w-xl">
          <SubsTab subscriptions={subscriptions} handleUnsubscribeFromCreator={handleUnsubscribeFromCreator} />
        </div>
      )}

    </div>
  )
}

export default CreatorProfile
