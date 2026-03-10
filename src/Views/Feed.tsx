import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { useFeedViewModel } from "../ViewModels/useFeedViewModel"
import PostCard from "../components/PostCard"

function Feed() {
  const { visiblePosts, getCreator, handleLike, isPostLiked, isCreatorSubscribed, isLoading, isFetchingMore, hasMore, loadMore, error, filter, setFilter } = useFeedViewModel()
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore() },
      { rootMargin: "200px" }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <div className="flex flex-col gap-6">

      <h1 className="text-2xl font-bold text-slate-900">🌀 Fil d'actualité</h1>

      {/* Onglets filtre style X.com */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setFilter('nouveautes')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            filter === 'nouveautes'
              ? "text-slate-900 border-b-2 border-slate-900"
              : "text-slate-400 hover:text-slate-700"
          }`}
        >
          Nouveautés
        </button>
        <button
          onClick={() => setFilter('abonnements')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            filter === 'abonnements'
              ? "text-slate-900 border-b-2 border-slate-900"
              : "text-slate-400 hover:text-slate-700"
          }`}
        >
          Abonnements
        </button>
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
      ) : visiblePosts.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          {filter === 'abonnements'
            ? "Tu n'es abonné à aucun créateur pour l'instant."
            : "Aucun post disponible."
          }
          {filter === 'abonnements' && (
            <div className="mt-3">
              <Link to="/creators" className="text-blue-600 hover:underline text-sm font-medium">
                Découvrir des créateurs →
              </Link>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visiblePosts.map((post) => {
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
                  <PostCard post={post} isSubscribed={isCreatorSubscribed(post.creatorId)} isLiked={isPostLiked(post.id)} onLike={handleLike} />
                </div>
              )
            })}
          </div>

          {/* Sentinel pour l'Intersection Observer */}
          <div ref={sentinelRef} className="h-4" />

          {isFetchingMore && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 h-64 animate-pulse" />
              ))}
            </div>
          )}

          {!hasMore && visiblePosts.length > 0 && (
            <p className="text-center text-sm text-slate-400 py-4">— Fin du fil —</p>
          )}
        </>
      )}

    </div>
  )
}

export default Feed
