import PremiumBlur from "./PremiumBlur"
import type { Post } from "../types/Post"

interface Props {
  post: Post
  isSubscribed?: boolean
  onLike?: (postId: string) => void
}

function PostCard({ post, isSubscribed = false, onLike }: Props) {
  const locked = post.isLocked && !isSubscribed

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      {/* Image */}
      <PremiumBlur isLocked={locked}>
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-52 object-cover"
        />
      </PremiumBlur>

      {/* Contenu */}
      <div className="p-4 flex flex-col gap-3">

        {/* Titre */}
        <h3 className="font-bold text-slate-900 leading-snug">{post.title}</h3>

        {/* Description */}
        <p className="text-sm text-slate-500 line-clamp-2">{post.description}</p>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer : likes + prix */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => onLike?.(post.id)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 transition-colors"
          >
            <span>❤️</span>
            <span>{post.likes.toLocaleString("fr-FR")}</span>
          </button>

          {locked && post.price && (
            <span className="text-sm font-semibold text-blue-600">
              {post.price.toFixed(2)} €
            </span>
          )}

          {locked && !post.price && (
            <span className="text-xs text-slate-400">Abonnement requis</span>
          )}
        </div>

      </div>
    </div>
  )
}

export default PostCard
