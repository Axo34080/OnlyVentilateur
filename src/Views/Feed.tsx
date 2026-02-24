import { Link } from "react-router-dom"
import { useFeedViewModel } from "../ViewModels/useFeedViewModel"
import PostCard from "../components/PostCard"

function Feed() {
  const { paginatedPosts, getCreator, handleLike, isPostLiked, isLoading, error, page, totalPages, setPage } = useFeedViewModel()

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">🌀 Fil d'actualité</h1>
        {!isLoading && !error && totalPages > 1 && (
          <span className="text-sm text-slate-400">Page {page} / {totalPages}</span>
        )}
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          ⚠️ {error}
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 h-64 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedPosts.map((post) => {
              const creator = getCreator(post.creatorId)
              return (
                <div key={post.id} className="flex flex-col gap-2">
                  {creator && (
                    <Link
                      to={`/creators/${creator.id}`}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={creator.avatar}
                        alt={creator.displayName}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium text-slate-700">{creator.displayName}</span>
                      <span className="text-xs text-slate-400">{creator.username}</span>
                    </Link>
                  )}
                  <PostCard post={post} isSubscribed={false} isLiked={isPostLiked(post.id)} onLike={handleLike} />
                </div>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                ← Précédent
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}

    </div>
  )
}

export default Feed
