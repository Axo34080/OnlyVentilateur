import { useRef, useState } from "react"
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
  isEditingProfile: boolean
  isSavingProfile: boolean
  isUploadingAvatar: boolean
  isUploadingCover: boolean
  profileError: string | null
  creator: Creator
  isSubscribed: boolean
  isCheckingSubscription: boolean
  creatorUserId?: string
  handleEditProfile: () => void
  handleCancelEditProfile: () => void
  handleSaveProfile: () => Promise<void>
  handleSubscribe: () => Promise<void>
}>

function ProfileButtons({
  isOwnProfile, isEditingProfile, isSavingProfile, isUploadingAvatar, isUploadingCover,
  profileError, creator, isSubscribed, isCheckingSubscription, creatorUserId,
  handleEditProfile, handleCancelEditProfile, handleSaveProfile, handleSubscribe,
}: ProfileButtonsProps) {
  if (isOwnProfile && isEditingProfile) {
    return (
      <div className="flex flex-col items-end gap-2">
        {profileError && (
          <p className="text-sm text-red-400 bg-red-900/20 px-3 py-1.5 rounded-lg max-w-xs text-right">{profileError}</p>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleSaveProfile}
            disabled={isSavingProfile || isUploadingAvatar || isUploadingCover}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-[#00AFF0] text-white hover:bg-[#0099CC] transition-colors disabled:opacity-50"
          >
            {isSavingProfile ? "Sauvegarde..." : "Sauvegarder"}
          </button>
          <button
            onClick={handleCancelEditProfile}
            disabled={isSavingProfile}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-[#2a2a2a] text-white hover:bg-[#333] transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    )
  }

  if (isOwnProfile) {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleEditProfile}
          className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-[#2a2a2a] text-white hover:bg-[#333] transition-colors border border-[#3a3a3a]"
        >
          Modifier le profil
        </button>
        <Link
          to="/dashboard"
          className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-[#00AFF0] text-white hover:bg-[#0099CC] transition-colors"
        >
          Gérer mon espace →
        </Link>
      </div>
    )
  }

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
          {isCheckingSubscription ? "..." : isSubscribed ? "Arrêter le souffle" : `Rejoindre les Souffleurs — ${creator.subscriptionPrice.toFixed(2)} €/mois`}
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
    isEditingProfile, isSavingProfile, profileForm, profileError, subscriptions,
    isUploadingAvatar, isUploadingCover,
    handleEditProfile, handleCancelEditProfile, handleSaveProfile, handleProfileChange,
    handleAvatarFileChange, handleCoverFileChange, handleUnsubscribeFromCreator,
    handleSubscribe, handleLike, isPostLiked,
  } = useCreatorProfileViewModel(id ?? "")

  const [activeTab, setActiveTab] = useState<Tab>("posts")
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="text-[#8a8a8a] text-sm animate-pulse">Chargement...</div>
      </div>
    )
  }

  if (error || !creator) return <Navigate to="/creators" replace />

  const avatarSrc = isEditingProfile ? (profileForm.avatar || creator.avatar) : creator.avatar
  const coverSrc = isEditingProfile ? (profileForm.coverImage || creator.coverImage) : creator.coverImage

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
        <div className="rounded-2xl overflow-hidden relative">
          <img src={coverSrc} alt="" className="w-full h-48 object-cover" />
          {/* Overlay édition couverture */}
          {isOwnProfile && isEditingProfile && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 px-6">
              <div className="flex gap-2 w-full max-w-md">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={isUploadingCover}
                  className="shrink-0 px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {isUploadingCover ? "..." : "Fichier"}
                </button>
                <input
                  type="url"
                  value={profileForm.coverImage}
                  onChange={(e) => handleProfileChange("coverImage", e.target.value)}
                  placeholder="ou coller une URL..."
                  className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AFF0]/40 bg-[#111] text-white border-0"
                />
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleCoverFileChange(file)
                  e.target.value = ""
                }}
              />
            </div>
          )}
        </div>

        {/* Avatar flottant */}
        {isOwnProfile && isEditingProfile ? (
          <button
            type="button"
            disabled={isUploadingAvatar}
            onClick={() => avatarInputRef.current?.click()}
            className="absolute -bottom-10 left-6 cursor-pointer group bg-transparent border-0 p-0"
            title="Changer la photo de profil"
          >
            <img
              src={avatarSrc}
              alt={creator.displayName}
              className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md"
            />
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {isUploadingAvatar ? (
                <svg className="w-6 h-6 text-white animate-spin" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.732l3.181 3.183m0-4.991v4.99" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              )}
            </div>
          </button>
        ) : (
          <div className="absolute -bottom-10 left-6">
            <img
              src={avatarSrc}
              alt={creator.displayName}
              className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md"
            />
          </div>
        )}

        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleAvatarFileChange(file)
            e.target.value = ""
          }}
        />
      </div>

      {/* Infos créateur */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-6 px-2">
        <div className="flex-1 min-w-0">

          {/* Nom d'affichage */}
          {isOwnProfile && isEditingProfile ? (
            <input
              type="text"
              value={profileForm.displayName}
              onChange={(e) => handleProfileChange("displayName", e.target.value)}
              className="text-2xl font-bold text-white border-b-2 border-[#00AFF0] focus:outline-none bg-transparent w-full max-w-xs"
              placeholder="Nom d'affichage"
            />
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{creator.displayName}</h1>
              {creator.isPremium && (
                <span className="text-xs font-semibold bg-[#00AFF0]/10 text-[#00AFF0] px-2 py-1 rounded-full">
                  Turbo
                </span>
              )}
            </div>
          )}

          <p className="text-[#8a8a8a] text-sm mt-0.5">{creator.username}</p>

          {/* Bio */}
          {isOwnProfile && isEditingProfile ? (
            <textarea
              value={profileForm.bio}
              onChange={(e) => handleProfileChange("bio", e.target.value)}
              rows={3}
              placeholder="Ta bio..."
              className="input-of mt-2 max-w-xl text-sm resize-none"
            />
          ) : (
            <p className="text-[#8a8a8a] mt-2 max-w-xl">{creator.bio}</p>
          )}

          {/* Prix abonnement (édition) */}
          {isOwnProfile && isEditingProfile && (
            <div className="flex items-center gap-2 mt-2">
              <label htmlFor="creator-sub-price" className="text-sm text-[#8a8a8a] shrink-0">Tarif Souffle :</label>
              <input
                id="creator-sub-price"
                type="number"
                min="0"
                step="0.01"
                value={profileForm.subscriptionPrice}
                onChange={(e) => handleProfileChange("subscriptionPrice", e.target.value)}
                className="input-of w-28 text-sm py-1.5 px-3"
              />
              <span className="text-sm text-[#8a8a8a]">€/mois</span>
            </div>
          )}

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
            isEditingProfile={isEditingProfile}
            isSavingProfile={isSavingProfile}
            isUploadingAvatar={isUploadingAvatar}
            isUploadingCover={isUploadingCover}
            profileError={profileError}
            creator={creator}
            isSubscribed={isSubscribed}
            isCheckingSubscription={isCheckingSubscription}
            creatorUserId={creator.userId}
            handleEditProfile={handleEditProfile}
            handleCancelEditProfile={handleCancelEditProfile}
            handleSaveProfile={handleSaveProfile}
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
