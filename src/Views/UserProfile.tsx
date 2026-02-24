import { useRef } from "react"
import { Link } from "react-router-dom"
import { useUserProfileViewModel } from "../ViewModels/useUserProfileViewModel"

function UserProfile() {
  const {
    user, form, isEditing, isSaving, error, subscriptions,
    handleEdit, handleCancel, handleSave, handleChange, handleAvatarChange, handleUnsubscribe,
  } = useUserProfileViewModel()

  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!user) return null

  const avatarSrc = isEditing ? form.avatar : user.avatar

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">

      {/* En-tête profil */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-6">

        {/* Avatar cliquable */}
        <div
          className="relative shrink-0 cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
          title="Changer la photo de profil"
        >
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={user.username}
              className="w-20 h-20 rounded-full object-cover border-2 border-slate-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
          {/* Overlay au hover */}
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-xl">📷</span>
          </div>
        </div>

        {/* Input fichier caché */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleAvatarChange(file)
            e.target.value = ""
          }}
        />

        <div>
          <h1 className="text-xl font-bold text-slate-900">{user.username}</h1>
          <p className="text-sm text-slate-400">{user.email}</p>
          {user.bio && <p className="text-sm text-slate-600 mt-1">{user.bio}</p>}
          <p className="text-xs text-slate-400 mt-1">Cliquer sur la photo pour la changer</p>
        </div>
      </div>

      {/* Formulaire d'édition */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Modifier le profil</h2>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Modifier
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={isEditing ? form.username : user.username}
              onChange={(e) => handleChange("username", e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 disabled:bg-slate-50 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
            <textarea
              value={isEditing ? form.bio : (user.bio ?? "")}
              onChange={(e) => handleChange("bio", e.target.value)}
              disabled={!isEditing}
              rows={3}
              placeholder="Parle de toi et de tes ventilateurs..."
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 disabled:bg-slate-50 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 resize-none"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>
        )}

        {isEditing && (
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
            >
              {isSaving ? "Sauvegarde..." : "Sauvegarder"}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
            >
              Annuler
            </button>
          </div>
        )}
      </div>

      {/* Abonnements */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-900 mb-4">Mes abonnements</h2>
        {subscriptions.length === 0 ? (
          <p className="text-sm text-slate-400">Tu n'es abonné à aucun créateur pour l'instant.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {subscriptions.map((creator) => (
              <div key={creator.id} className="flex items-center justify-between gap-3">
                <Link
                  to={`/creators/${creator.id}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity min-w-0"
                >
                  <img
                    src={creator.avatar}
                    alt={creator.displayName}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 text-sm truncate">{creator.displayName}</div>
                    <div className="text-xs text-slate-400 truncate">{creator.username}</div>
                  </div>
                </Link>
                <button
                  onClick={() => handleUnsubscribe(creator.id)}
                  className="text-xs text-slate-500 hover:text-red-500 transition-colors shrink-0 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-lg"
                >
                  Se désabonner
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
