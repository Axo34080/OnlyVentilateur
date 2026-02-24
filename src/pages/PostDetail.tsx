import { useState, useEffect } from "react"
import { useParams, Link, Navigate } from "react-router-dom"
import { getPostById, getLikedPostIds } from "../services/creatorsService"
import { useAuth } from "../context/AuthContext"
import PremiumBlur from "../components/PremiumBlur"
import type { Post } from "../types/Post"
import type { Creator } from "../types/Creator"

function PostDetail() {
  const { id } = useParams<{ id: string }>()
  const { token } = useAuth()
  const [post, setPost] = useState<(Post & { creator: Creator }) | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    if (!id) return
    getPostById(id)
      .then((data) => {
        setPost(data)
        setLikes(data.likes)
      })
      .catch(() => setError(true))
      .finally(() => setIsLoading(false))
  }, [id])

  useEffect(() => {
    if (!token || !id) return
    getLikedPostIds(token)
      .then((ids) => setIsLiked(ids.includes(id)))
      .catch(() => {})
  }, [token, id])

  const handleLike = () => {
    if (!token) return

    const wasLiked = isLiked
    setIsLiked(!wasLiked)
    setLikes((prev) => wasLiked ? Math.max(0, prev - 1) : prev + 1)

    fetch(`/api/posts/${id}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((result: { likes: number; isLiked: boolean }) => {
        setLikes(result.likes)
        setIsLiked(result.isLiked)
      })
      .catch(() => {
        setIsLiked(wasLiked)
        setLikes((prev) => wasLiked ? prev + 1 : Math.max(0, prev - 1))
      })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="text-slate-400 text-sm animate-pulse">Chargement...</div>
      </div>
    )
  }

  if (error || !post) return <Navigate to="/feed" replace />

  const locked = post.isLocked && !token

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">

      {/* Fil d'ariane */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link to="/feed" className="hover:text-slate-700 transition-colors">Fil</Link>
        <span>/</span>
        <Link to={`/creators/${post.creator.id}`} className="hover:text-slate-700 transition-colors">
          {post.creator.displayName}
        </Link>
        <span>/</span>
        <span className="text-slate-600 truncate">{post.title}</span>
      </div>

      {/* Créateur */}
      <Link
        to={`/creators/${post.creator.id}`}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <img
          src={post.creator.avatar}
          alt={post.creator.displayName}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <div className="font-semibold text-slate-900">{post.creator.displayName}</div>
          <div className="text-xs text-slate-400">{post.creator.username}</div>
        </div>
      </Link>

      {/* Image */}
      <PremiumBlur isLocked={locked}>
        <img
          src={post.image}
          alt={post.title}
          className="w-full rounded-2xl object-cover max-h-[480px]"
        />
      </PremiumBlur>

      {/* Contenu */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900">{post.title}</h1>
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-colors shrink-0 ${
              isLiked ? "text-red-500" : "text-slate-400 hover:text-red-500"
            }`}
          >
            <span>{isLiked ? "❤️" : "🤍"}</span>
            <span className="font-semibold">{likes.toLocaleString("fr-FR")}</span>
          </button>
        </div>

        <p className="text-slate-600 leading-relaxed">{post.description}</p>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Abonnement requis */}
        {locked && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-blue-900 text-sm">Contenu premium</div>
              <div className="text-xs text-blue-600 mt-0.5">
                Abonnez-vous à {post.creator.displayName} pour voir ce post
              </div>
            </div>
            <Link
              to={`/subscribe/${post.creator.id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shrink-0"
            >
              S'abonner — {post.creator.subscriptionPrice.toFixed(2)} €/mois
            </Link>
          </div>
        )}

        <div className="text-xs text-slate-400">
          Publié le {new Date(post.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

    </div>
  )
}

export default PostDetail
