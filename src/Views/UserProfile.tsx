import { useRef } from "react"
import { Link, Navigate, useLocation } from "react-router-dom"
import { useUserProfileViewModel } from "../ViewModels/useUserProfileViewModel"
import type { Creator } from "../types/Creator"

type CreatorForm = { displayName: string; coverImage: string; subscriptionPrice: string }

type CreatorSectionProps = Readonly<{
  creatorId: string | undefined
  creatorData: Creator | null | undefined
  creatorForm: CreatorForm
  isEditingCreator: boolean
  isSavingCreator: boolean
  creatorError: string | null
  handleEditCreator: () => void
  handleCancelCreator: () => void
  handleSaveCreator: () => Promise<void>
  handleCreatorChange: (field: keyof CreatorForm, value: string) => void
}>

function CreatorSection({
  creatorId, creatorData, creatorForm, isEditingCreator, isSavingCreator, creatorError,
  handleEditCreator, handleCancelCreator, handleSaveCreator, handleCreatorChange,
}: CreatorSectionProps) {
  const coverSrc = isEditingCreator ? creatorForm.coverImage : creatorData?.coverImage

  return (
    <div className="bg-[#111] rounded-2xl border border-[#2a2a2a] overflow-hidden">
      <div className="relative h-32 bg-gradient-to-r from-[#00AFF0]/20 to-[#1a1a1a] overflow-hidden">
        {coverSrc && (
          <img
            src={coverSrc}
            alt="Couverture" className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
          />
        )}
        <div className="absolute bottom-2 right-3 text-xs text-white/70 bg-black/30 px-2 py-0.5 rounded">
          Aperçu couverture
        </div>
      </div>

      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-white">Profil Ventilateur</h2>
          <div className="flex items-center gap-3">
            <Link to={`/creators/${creatorId}`} className="text-sm text-[#8a8a8a] hover:text-white transition-colors">
              {"Voir ma page →"}
            </Link>
            {!isEditingCreator && (
              <button onClick={handleEditCreator} className="text-sm text-[#00AFF0] hover:underline font-medium">Modifier</button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="creator-displayname" className="block text-sm font-medium text-[#8a8a8a] mb-1">{"Nom d'affichage"}</label>
            <input id="creator-displayname" type="text"
              value={isEditingCreator ? creatorForm.displayName : (creatorData?.displayName ?? "")}
              onChange={(e) => handleCreatorChange("displayName", e.target.value)} disabled={!isEditingCreator}
              className="input-of disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="creator-cover" className="block text-sm font-medium text-[#8a8a8a] mb-1">URL photo de couverture</label>
            <input id="creator-cover" type="url"
              value={isEditingCreator ? creatorForm.coverImage : (creatorData?.coverImage ?? "")}
              onChange={(e) => handleCreatorChange("coverImage", e.target.value)} disabled={!isEditingCreator}
              placeholder="https://..."
              className="input-of disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="creator-price" className="block text-sm font-medium text-[#8a8a8a] mb-1">Tarif Souffle (€/mois)</label>
            <input id="creator-price" type="number" min="0" step="0.01"
              value={isEditingCreator ? creatorForm.subscriptionPrice : (creatorData?.subscriptionPrice?.toString() ?? "")}
              onChange={(e) => handleCreatorChange("subscriptionPrice", e.target.value)} disabled={!isEditingCreator}
              className="input-of disabled:opacity-50"
            />
          </div>
        </div>

        {creatorError && <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/50 px-4 py-2.5 rounded-lg">{creatorError}</p>}

        {isEditingCreator && (
          <div className="flex gap-3 pt-1">
            <button onClick={handleSaveCreator} disabled={isSavingCreator}
              className="bg-[#00AFF0] hover:bg-[#0099CC] disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors">
              {isSavingCreator ? "Sauvegarde..." : "Sauvegarder"}
            </button>
            <button onClick={handleCancelCreator} disabled={isSavingCreator}
              className="bg-[#2a2a2a] hover:bg-[#333] text-[#8a8a8a] hover:text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors">
              Annuler
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function UserProfile() {
  const location = useLocation()
  const {
    user, form, creatorForm, creatorData,
    isEditing, isEditingCreator, isSaving, isSavingCreator,
    error, creatorError, subscriptions,
    allowVideoCall, handleToggleVideoCall,
    handleEdit, handleCancel, handleSave, handleChange, handleAvatarChange, handleUnsubscribe,
    handleEditCreator, handleCancelCreator, handleSaveCreator, handleCreatorChange,
  } = useUserProfileViewModel()

  const fileInputRef = useRef<HTMLInputElement>(null)

  // /profile → redirige vers la page créateur. /profile/edit → formulaire d'édition
  if (user?.creatorId && location.pathname === "/profile") {
    return <Navigate to={`/creators/${user.creatorId}`} replace />
  }
  // Fallback si creatorId pas encore chargé
  if (!user?.creatorId && location.pathname === "/profile") {
    return <Navigate to="/dashboard" replace />
  }

  if (!user) return null

  const avatarSrc = isEditing ? form.avatar : user.avatar

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">

      {/* En-tête profil */}
      <div className="bg-[#111] rounded-2xl border border-[#2a2a2a] p-6 flex items-center gap-6">
        <div
          role="button"
          tabIndex={0}
          className="relative shrink-0 cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click() }}
          title="Changer la photo de profil"
        >
          {avatarSrc ? (
            <img src={avatarSrc} alt={user.username} className="w-20 h-20 rounded-full object-cover border-2 border-[#2a2a2a]" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#00AFF0]/10 flex items-center justify-center text-2xl font-bold text-[#00AFF0]">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleAvatarChange(file)
            e.target.value = ""
          }}
        />

        <div>
          <h1 className="text-xl font-bold text-white">{user.username}</h1>
          <p className="text-sm text-[#8a8a8a]">{user.email}</p>
          {user.bio && <p className="text-sm text-[#8a8a8a] mt-1">{user.bio}</p>}
          <span className="inline-block mt-1 text-xs bg-[#00AFF0]/10 text-[#00AFF0] px-2 py-0.5 rounded-full font-medium">Ventilateur</span>
          <p className="text-xs text-[#555] mt-1">Cliquer sur la photo pour la changer</p>
        </div>
      </div>

      {/* Profil utilisateur */}
      <div className="bg-[#111] rounded-2xl border border-[#2a2a2a] p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-white">Modifier le profil</h2>
          {!isEditing && (
            <button onClick={handleEdit} className="text-sm text-[#00AFF0] hover:underline font-medium">Modifier</button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="profile-username" className="block text-sm font-medium text-[#8a8a8a] mb-1">{"Nom d'utilisateur"}</label>
            <input id="profile-username" type="text" value={isEditing ? form.username : user.username}
              onChange={(e) => handleChange("username", e.target.value)} disabled={!isEditing}
              className="input-of disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="profile-bio" className="block text-sm font-medium text-[#8a8a8a] mb-1">Bio</label>
            <textarea id="profile-bio" value={isEditing ? form.bio : (user.bio ?? "")}
              onChange={(e) => handleChange("bio", e.target.value)} disabled={!isEditing}
              rows={3} placeholder="Parle de toi et de tes ventilateurs..."
              className="input-of resize-none disabled:opacity-50"
            />
            {isEditing && (
              <p className="text-xs text-[#555] mt-1">La bio est aussi affichée sur ton profil Ventilateur</p>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/50 px-4 py-2.5 rounded-lg">{error}</p>}

        {isEditing && (
          <div className="flex gap-3 pt-1">
            <button onClick={handleSave} disabled={isSaving}
              className="bg-[#00AFF0] hover:bg-[#0099CC] disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors">
              {isSaving ? "Sauvegarde..." : "Sauvegarder"}
            </button>
            <button onClick={handleCancel} disabled={isSaving}
              className="bg-[#2a2a2a] hover:bg-[#333] text-[#8a8a8a] hover:text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors">
              Annuler
            </button>
          </div>
        )}
      </div>

      {/* Confidentialité */}
      <div className="bg-[#111] rounded-2xl border border-[#2a2a2a] p-6">
        <h2 className="font-bold text-white mb-4">Confidentialité</h2>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white">Autoriser les appels vidéo</p>
            <p className="text-xs text-[#8a8a8a] mt-0.5">
              Si désactivé, personne ne pourra vous appeler en vidéo
            </p>
          </div>
          <button
            role="switch"
            aria-checked={allowVideoCall}
            onClick={handleToggleVideoCall}
            className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00AFF0] ${
              allowVideoCall ? 'bg-[#00AFF0]' : 'bg-[#2a2a2a]'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                allowVideoCall ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Profil créateur */}
      <CreatorSection
        creatorId={user.creatorId}
        creatorData={creatorData}
        creatorForm={creatorForm}
        isEditingCreator={isEditingCreator}
        isSavingCreator={isSavingCreator}
        creatorError={creatorError}
        handleEditCreator={handleEditCreator}
        handleCancelCreator={handleCancelCreator}
        handleSaveCreator={handleSaveCreator}
        handleCreatorChange={handleCreatorChange}
      />

      {/* Abonnements */}
      <div className="bg-[#111] rounded-2xl border border-[#2a2a2a] p-6">
        <h2 className="font-bold text-white mb-4">Mes Souffleurs suivis</h2>
        {subscriptions.length === 0 ? (
          <p className="text-sm text-[#8a8a8a]">{"Tu ne suis aucun Ventilateur pour l'instant."}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {subscriptions.map((creator) => (
              <div key={creator.id} className="flex items-center justify-between gap-3">
                <Link to={`/creators/${creator.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity min-w-0">
                  <img src={creator.avatar} alt={creator.displayName} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-white text-sm truncate">{creator.displayName}</div>
                    <div className="text-xs text-[#555] truncate">{creator.username}</div>
                  </div>
                </Link>
                <button onClick={() => handleUnsubscribe(creator.id)}
                  className="text-xs text-[#8a8a8a] hover:text-red-400 transition-colors shrink-0 border border-[#2a2a2a] hover:border-red-800/50 px-3 py-1.5 rounded-lg">
                  Arrêter le souffle
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default UserProfile
