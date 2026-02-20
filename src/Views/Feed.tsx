import { Link } from "react-router-dom"
import { useFeedViewModel } from "../ViewModels/useFeedViewModel"
import PostCard from "../components/PostCard"

function Feed() {
  const { posts, getCreator, handleLike, isLoading } = useFeedViewModel()

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">🌀 Fil d'actualité</h1>
        <span className="text-sm text-slate-400">
          {isLoading ? "Chargement..." : `${posts.length} publications`}
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 h-64 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => {
            const creator = getCreator(post.creatorId)
            return (
              <div key={post.id} className="flex flex-col gap-2">
                {/* Créateur au-dessus de la card */}
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
                    <span className="text-sm font-medium text-slate-700">
                      {creator.displayName}
                    </span>
                    <span className="text-xs text-slate-400">{creator.username}</span>
                  </Link>
                )}
                <PostCard post={post} isSubscribed={false} onLike={handleLike} />
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}

export default Feed
