import { useParams, Navigate, Link } from "react-router-dom"
import { useUserPublicProfileViewModel } from "../ViewModels/useUserPublicProfileViewModel"

function UserPublicProfile() {
  const { id } = useParams<{ id: string }>()
  const { publicUser, isLoading, isOwnProfile, isCreator } = useUserPublicProfileViewModel(id ?? "")

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="text-slate-400 text-sm animate-pulse">Chargement...</div>
      </div>
    )
  }

  if (!publicUser) return <Navigate to="/" replace />

  // Si l'utilisateur est créateur, rediriger vers sa page créateur
  if (isCreator) return <Navigate to={`/creators/${publicUser.creatorId}`} replace />

  const avatarSrc = publicUser.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(publicUser.username)}&background=e2e8f0&color=475569`

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6 py-8">

      {/* Carte profil */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center gap-4 text-center">
        <img
          src={avatarSrc}
          alt={publicUser.username}
          className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow"
        />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{publicUser.username}</h1>
          {publicUser.bio && (
            <p className="text-slate-500 mt-2 text-sm max-w-sm">{publicUser.bio}</p>
          )}
        </div>

        {isOwnProfile && (
          <div className="flex flex-col gap-3 w-full max-w-xs mt-2">
            <Link
              to="/profile/edit"
              className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200 text-center"
            >
              Modifier le profil
            </Link>
            <Link
              to="/become-creator"
              className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors text-center"
            >
              Devenir créateur →
            </Link>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-slate-50 rounded-xl px-5 py-4 text-sm text-slate-500 text-center">
        Ce membre n'est pas encore créateur.{" "}
        {!isOwnProfile && (
          <Link to="/creators" className="text-blue-600 hover:underline">
            Découvrir les créateurs →
          </Link>
        )}
      </div>

    </div>
  )
}

export default UserPublicProfile
