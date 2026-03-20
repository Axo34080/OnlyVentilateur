import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import PremiumBlur from "./PremiumBlur"
import type { Post } from "../types/Post"

type Props = Readonly<{
  post: Post
  isSubscribed?: boolean
  isLiked?: boolean
  onLike?: (postId: string) => void
}>

function PostCard({ post, isSubscribed = false, isLiked = false, onLike }: Props) {
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const isOwnPost = user?.creatorId === post.creatorId
  const locked = post.isLocked && !isSubscribed && !isOwnPost

  const handleNavigate = () => {
    if (locked) {
      navigate(token ? `/subscribe/${post.creatorId}` : "/login")
    } else {
      navigate(`/posts/${post.id}`)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] shadow-sm overflow-hidden hover:border-[#00AFF0]/30 transition-colors cursor-pointer"
      onClick={handleNavigate}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleNavigate() }}
    >

      {/* Image */}
      <PremiumBlur isLocked={locked}>
        {post.image ? (
          <img src={post.image} alt={post.title} className="w-full h-52 object-cover" />
        ) : (
          <div className="w-full h-52 bg-[#111] flex items-center justify-center">
            <svg className="w-10 h-10 text-[#2a2a2a]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
        )}
      </PremiumBlur>

      {/* Contenu */}
      <div className="p-4 flex flex-col gap-3">

        {/* Titre */}
        <h3 className="font-bold text-white leading-snug">{post.title}</h3>

        {/* Description */}
        <p className="text-sm text-[#8a8a8a] line-clamp-2">{post.description}</p>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-[#2a2a2a] text-[#8a8a8a] px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer : likes + prix */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={(e) => { e.stopPropagation(); onLike?.(post.id) }}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              isLiked ? "text-red-500" : "text-[#555] hover:text-red-500"
            }`}
          >
            <svg className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <span>{post.likes.toLocaleString("fr-FR")} rafales</span>
          </button>

          {locked && post.price && (
            <span className="text-sm font-semibold text-[#00AFF0]">
              {post.price.toFixed(2)} €
            </span>
          )}

          {locked && !post.price && (
            <span className="text-xs text-[#555]">Souffle exclusif</span>
          )}
        </div>

      </div>
    </div>
  )
}

export default PostCard
