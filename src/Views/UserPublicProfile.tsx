import { useParams, Navigate, Link } from "react-router-dom"
import { useUserPublicProfileViewModel } from "../ViewModels/useUserPublicProfileViewModel"

function UserPublicProfile() {
  const { id } = useParams<{ id: string }>()
  const { publicUser, isLoading, isOwnProfile, isCreator } = useUserPublicProfileViewModel(id ?? "")

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="text-[#8a8a8a] text-sm animate-pulse">Chargement...</div>
      </div>
    )
  }

  if (!publicUser) return <Navigate to="/" replace />

  // Si l'utilisateur est créateur, rediriger vers sa page créateur
  if (isCreator) return <Navigate to={`/creators/${publicUser.creatorId}`} replace />

  const avatarSrc = publicUser.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(publicUser.username)}&background=1a1a1a&color=8a8a8a`

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6 py-8">

      {/* Carte profil */}
      <div className="bg-[#111] rounded-2xl border border-[#2a2a2a] p-8 flex flex-col items-center gap-4 text-center">
        <img
          src={avatarSrc}
          alt={publicUser.username}
          className="w-24 h-24 rounded-full object-cover border-4 border-[#2a2a2a] shadow"
        />
        <div>
          <h1 className="text-2xl font-bold text-white">{publicUser.username}</h1>
          {publicUser.bio && (
            <p className="text-[#8a8a8a] mt-2 text-sm max-w-sm">{publicUser.bio}</p>
          )}
        </div>

        {isOwnProfile && (
          <div className="flex flex-col gap-3 w-full max-w-xs mt-2">
            <Link
              to="/profile/edit"
              className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-[#1a1a1a] text-[#8a8a8a] hover:bg-[#2a2a2a] hover:text-white transition-colors border border-[#2a2a2a] text-center"
            >
              Modifier le profil
            </Link>
            <Link
              to="/become-creator"
              className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-[#00AFF0] text-white hover:bg-[#0099CC] transition-colors text-center"
            >
              Devenir Ventilateur →
            </Link>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-[#111] rounded-xl border border-[#2a2a2a] px-5 py-4 text-sm text-[#8a8a8a] text-center">
        Ce Souffleur n'est pas encore Ventilateur.{" "}
        {!isOwnProfile && (
          <Link to="/creators" className="text-[#00AFF0] hover:underline">
            Découvrir les Ventilateurs →
          </Link>
        )}
      </div>

    </div>
  )
}

export default UserPublicProfile
