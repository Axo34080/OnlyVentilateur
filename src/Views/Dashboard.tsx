import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useDashboardViewModel } from "../ViewModels/useDashboardViewModel"

function Dashboard() {
  const { user } = useAuth()
  const { creator, posts, isLoading, error, handleDeletePost } = useDashboardViewModel()
  const navigate = useNavigate()

  // Redirige si l'utilisateur n'est pas créateur
  if (!user?.creatorId) {
    return (
      <div className="max-w-lg mx-auto text-center flex flex-col gap-4 mt-12">
        <div className="text-5xl">🌀</div>
        <h1 className="text-xl font-bold text-slate-900">Tu n'es pas encore créateur</h1>
        <p className="text-slate-500 text-sm">Crée ton espace créateur pour accéder au dashboard.</p>
        <Link
          to="/become-creator"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Devenir créateur
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-center py-16 text-slate-400">Chargement du dashboard...</div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16 text-red-500">{error}</div>
    )
  }

  const revenue = posts
    .filter((p) => p.isLocked && p.price)
    .reduce((sum, p) => sum + (p.price ?? 0), 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard créateur</h1>
          {creator && (
            <p className="text-slate-400 text-sm">@{creator.username}</p>
          )}
        </div>
        <button
          onClick={() => navigate("/dashboard/new-post")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          + Nouveau post
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Posts" value={posts.length} />
        <StatCard label="Abonnés" value={creator?.subscriberCount ?? 0} />
        <StatCard label="Prix abonnement" value={`${creator?.subscriptionPrice ?? 0} €/mois`} />
        <StatCard label="Posts premium" value={posts.filter((p) => p.isLocked).length} />
      </div>

      {revenue > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 text-sm text-green-700">
          Revenu potentiel (contenu premium) : <strong>{revenue.toFixed(2)} €</strong>
        </div>
      )}

      {/* Liste des posts */}
      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Mes posts</h2>
          <span className="text-xs text-slate-400">{posts.length} post{posts.length !== 1 ? "s" : ""}</span>
        </div>

        {posts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-slate-400 text-sm mb-4">Tu n'as pas encore publié de post.</p>
            <button
              onClick={() => navigate("/dashboard/new-post")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
            >
              Créer mon premier post
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {posts.map((post) => (
              <div key={post.id} className="px-6 py-4 flex items-center gap-4">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-14 h-14 rounded-lg object-cover shrink-0 bg-slate-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm truncate">{post.title}</span>
                    {post.isLocked && (
                      <span className="shrink-0 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        Premium {post.price ? `${post.price} €` : ""}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{post.description}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span>{post.likes} like{post.likes !== 1 ? "s" : ""}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/dashboard/edit-post/${post.id}`)}
                    className="text-xs text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Éditer
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Supprimer ce post ?")) handleDeletePost(post.id)
                    }}
                    className="text-xs text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-slate-900">{value}</p>
    </div>
  )
}

export default Dashboard
