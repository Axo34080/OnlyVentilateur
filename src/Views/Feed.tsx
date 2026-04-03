import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { useFeedViewModel } from "../ViewModels/useFeedViewModel"
import PostCard from "../components/PostCard"

function Feed() {
  const { visiblePosts, getCreator, handleLike, isPostLiked, isCreatorSubscribed, isLoading, isFetchingMore, hasMore, loadMore, error, filter, setFilter } = useFeedViewModel()
  const sentinelRef = useRef<HTMLDivElement>(null)

  /**
   * PRÉSENTATION — Infinite scroll avec Intersection Observer
   *
   * On place un élément invisible (sentinelRef) en bas de la liste.
   * L'IntersectionObserver déclenche loadMore() dès que cet élément
   * entre dans le viewport (avec 200px d'anticipation).
   * → Pas d'événement scroll, pas de calcul de position → performant.
   * Le cleanup (observer.disconnect) évite les fuites mémoire.
   */
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
      {/* Onglets filtre style X.com */}
      <div className="flex border-b border-[#2a2a2a]">
        <button
          onClick={() => setFilter('nouveautes')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            filter === 'nouveautes'
              ? "text-white border-b-2 border-[#00AFF0]"
              : "text-[#8a8a8a] hover:text-white"
          }`}
        >
          Nouveautés
        </button>
        <button
          onClick={() => setFilter('abonnements')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            filter === 'abonnements'
              ? "text-white border-b-2 border-[#00AFF0]"
              : "text-[#8a8a8a] hover:text-white"
          }`}
        >
          Abonnements
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-400 rounded-xl px-4 py-3 text-sm">
          ⚠️ {error}
        </div>
      )}

      {!error && isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] h-64 animate-pulse" />
          ))}
        </div>
      )}

      {!error && !isLoading && visiblePosts.length === 0 && (
        <div className="text-center py-16 text-[#8a8a8a]">
          {filter === 'abonnements'
            ? "Tu n'es abonné à aucun créateur pour l'instant."
            : "Aucun post disponible."
          }
          {filter === 'abonnements' && (
            <div className="mt-3">
              <Link to="/creators" className="text-[#00AFF0] hover:underline text-sm font-medium">
                Découvrir des créateurs →
              </Link>
            </div>
          )}
        </div>
      )}

      {!error && !isLoading && visiblePosts.length > 0 && (
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
                      <span className="text-sm font-medium text-white">{creator.displayName}</span>
                      <span className="text-xs text-[#8a8a8a]">{creator.username}</span>
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
                <div key={`skeleton-${i}`} className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] h-64 animate-pulse" />
              ))}
            </div>
          )}

          {!hasMore && visiblePosts.length > 0 && (
            <p className="text-center text-sm text-[#555] py-4">— Fin du fil —</p>
          )}
        </>
      )}

    </div>
  )
}

export default Feed
