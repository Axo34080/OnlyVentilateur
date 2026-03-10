import { useRef, useState } from "react"
import { useParams, Navigate, Link } from "react-router-dom"
import { useCreatorProfileViewModel } from "../ViewModels/useCreatorProfileViewModel"
import PostCard from "../components/PostCard"

type Tab = "posts" | "about" | "subs"

function CreatorProfile() {
  const { id } = useParams<{ id: string }>()
  const {
    creator, posts, isSubscribed, isCheckingSubscription, isLoading, error, isOwnProfile,
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
        <div className="text-slate-400 text-sm animate-pulse">Chargement...</div>
      </div>
    )
  }

  if (error || !creator) return <Navigate to="/creators" replace />

  const avatarSrc = isEditingProfile ? (profileForm.avatar || creator.avatar) : creator.avatar
  const coverSrc = isEditingProfile ? (profileForm.coverImage || creator.coverImage) : creator.coverImage

  const tabs: { key: Tab; label: string }[] = [
    { key: "posts", label: `Publications (${posts.length})` },
    { key: "about", label: "À propos" },
    ...(isOwnProfile ? [{ key: "subs" as Tab, label: "Mes abonnements" }] : []),
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
                  className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
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
        <div
          role={isOwnProfile && isEditingProfile ? "button" : undefined}
          tabIndex={isOwnProfile && isEditingProfile ? 0 : undefined}
          className={`absolute -bottom-10 left-6 ${isOwnProfile && isEditingProfile ? "cursor-pointer group" : ""}`}
          onClick={() => isOwnProfile && isEditingProfile && !isUploadingAvatar && avatarInputRef.current?.click()}
          onKeyDown={(e) => { if (isOwnProfile && isEditingProfile && (e.key === "Enter" || e.key === " ")) avatarInputRef.current?.click() }}
          title={isOwnProfile && isEditingProfile ? "Changer la photo de profil" : undefined}
        >
          <img
            src={avatarSrc}
            alt={creator.displayName}
            className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md"
          />
          {isOwnProfile && isEditingProfile && (
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xl">{isUploadingAvatar ? "⏳" : "📷"}</span>
            </div>
          )}
        </div>

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
              className="text-2xl font-bold text-slate-900 border-b-2 border-blue-400 focus:outline-none bg-transparent w-full max-w-xs"
              placeholder="Nom d'affichage"
            />
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">{creator.displayName}</h1>
              {creator.isPremium && (
                <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                  ⭐ Premium
                </span>
              )}
            </div>
          )}

          <p className="text-slate-400 text-sm mt-0.5">{creator.username}</p>

          {/* Bio */}
          {isOwnProfile && isEditingProfile ? (
            <textarea
              value={profileForm.bio}
              onChange={(e) => handleProfileChange("bio", e.target.value)}
              rows={3}
              placeholder="Ta bio..."
              className="mt-2 w-full max-w-xl px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 text-sm resize-none"
            />
          ) : (
            <p className="text-slate-600 mt-2 max-w-xl">{creator.bio}</p>
          )}

          {/* Prix abonnement (édition) */}
          {isOwnProfile && isEditingProfile && (
            <div className="flex items-center gap-2 mt-2">
              <label htmlFor="creator-sub-price" className="text-sm text-slate-500 shrink-0">Prix abonnement :</label>
              <input
                id="creator-sub-price"
                type="number"
                min="0"
                step="0.01"
                value={profileForm.subscriptionPrice}
                onChange={(e) => handleProfileChange("subscriptionPrice", e.target.value)}
                className="w-28 px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm"
              />
              <span className="text-sm text-slate-500">€/mois</span>
            </div>
          )}

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

        {/* Boutons droite */}
        <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
          {isOwnProfile ? (
            isEditingProfile ? (
              <div className="flex flex-col items-end gap-2">
                {profileError && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-1.5 rounded-lg max-w-xs text-right">{profileError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile || isUploadingAvatar || isUploadingCover}
                    className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSavingProfile ? "Sauvegarde..." : "Sauvegarder"}
                  </button>
                  <button
                    onClick={handleCancelEditProfile}
                    disabled={isSavingProfile}
                    className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleEditProfile}
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200"
                >
                  Modifier le profil
                </button>
                <Link
                  to="/dashboard"
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Gérer mon espace →
                </Link>
              </div>
            )
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-slate-200 flex gap-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Onglet Publications */}
      {activeTab === "posts" && (
        posts.length === 0 ? (
          <p className="text-slate-400 text-sm">Aucune publication pour le moment.</p>
        ) : (
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
      )}

      {/* Onglet À propos */}
      {activeTab === "about" && (
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

      {/* Onglet Mes abonnements (own profile uniquement) */}
      {activeTab === "subs" && isOwnProfile && (
        <div className="max-w-xl">
          {subscriptions.length === 0 ? (
            <p className="text-sm text-slate-400">{"Tu n'es abonné à aucun créateur pour l'instant."}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between gap-3">
                  <Link
                    to={`/creators/${sub.id}`}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity min-w-0"
                  >
                    <img src={sub.avatar} alt={sub.displayName} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 text-sm truncate">{sub.displayName}</div>
                      <div className="text-xs text-slate-400 truncate">{sub.username}</div>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleUnsubscribeFromCreator(sub.id)}
                    className="text-xs text-slate-500 hover:text-red-500 transition-colors shrink-0 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-lg"
                  >
                    Se désabonner
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}

export default CreatorProfile
