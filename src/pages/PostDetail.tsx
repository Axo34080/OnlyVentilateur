import { useState, useEffect, useRef } from "react"
import { useParams, Link, Navigate } from "react-router-dom"
import { getPostById, getLikedPostIds } from "../services/creatorsService"
import { getComments, addComment } from "../services/commentsService"
import { useAuth } from "../context/AuthContext"
import PremiumBlur from "../components/PremiumBlur"
import type { Post } from "../types/Post"
import type { Creator } from "../types/Creator"
import type { Comment } from "../services/commentsService"

function PostDetail() {
  const { id } = useParams<{ id: string }>()
  const { token } = useAuth()
  const [post, setPost] = useState<(Post & { creator: Creator }) | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  useEffect(() => {
    if (!id) return
    getComments(id).then(setComments).catch(() => {})
  }, [id])

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

  const handleSubmitComment = async () => {
    if (!token || !id || !newComment.trim()) return
    setIsSubmitting(true)
    try {
      const comment = await addComment(id, newComment.trim(), token)
      setComments((prev) => [comment, ...prev])
      setNewComment("")
    } catch {
      // silently fail
    } finally {
      setIsSubmitting(false)
    }
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

      {/* Commentaires */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4">
        <h2 className="font-bold text-slate-900">Commentaires ({comments.length})</h2>

        {token ? (
          <div className="flex flex-col gap-2">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Écrire un commentaire..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 resize-none text-sm"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSubmitComment}
                disabled={isSubmitting || !newComment.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
              >
                {isSubmitting ? "Envoi..." : "Commenter"}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            <Link to="/login" className="text-blue-600 hover:underline">Connecte-toi</Link> pour commenter.
          </p>
        )}

        {comments.length === 0 ? (
          <p className="text-sm text-slate-400">Soyez le premier à commenter !</p>
        ) : (
          <div className="flex flex-col gap-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3">
                {comment.avatar ? (
                  <img src={comment.avatar} alt={comment.username} className="w-8 h-8 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
                    {comment.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-slate-900 text-sm">{comment.username}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(comment.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mt-0.5">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default PostDetail
