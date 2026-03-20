import { useState, useEffect, useRef } from "react"
import { useParams, Link, Navigate } from "react-router-dom"
import { getPostById, getLikedPostIds } from "../services/creatorsService"
import { getComments, addComment } from "../services/commentsService"
import { getUserSubscriptions } from "../services/subscriptionService"
import { useAuth } from "../context/AuthContext"
import type { Post } from "../types/Post"
import type { Creator } from "../types/Creator"
import type { Comment } from "../services/commentsService"

function PostDetail() {
  const { id } = useParams<{ id: string }>()
  const { token, user } = useAuth()
  const [post, setPost] = useState<(Post & { creator: Creator }) | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const data = await getPostById(id, token)
        setPost(data)
        setLikes(data.likes)
        if (token) {
          const [subs, likedIds] = await Promise.allSettled([
            getUserSubscriptions(token),
            getLikedPostIds(token),
          ])
          if (subs.status === "fulfilled") setIsSubscribed(subs.value.includes(data.creator.id))
          if (likedIds.status === "fulfilled") setIsLiked(likedIds.value.includes(id))
        }
      } catch {
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id, token])

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
      .then((res) => { if (!res.ok) throw new Error(); return res.json() })
      .then((result: { likes: number; isLiked: boolean }) => { setLikes(result.likes); setIsLiked(result.isLiked) })
      .catch(() => { setIsLiked(wasLiked); setLikes((prev) => wasLiked ? prev + 1 : Math.max(0, prev - 1)) })
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
        <div className="text-[#8a8a8a] text-sm animate-pulse">Chargement...</div>
      </div>
    )
  }

  if (error || !post) return <Navigate to="/feed" replace />

  const isOwnPost = user?.creatorId === post.creator.id
  const locked = post.isLocked && !isSubscribed && !isOwnPost

  // Page CTA abonnement si contenu verrouillé
  if (locked) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div className="flex items-center gap-2 text-sm text-[#8a8a8a]">
          <Link to="/feed" className="hover:text-white transition-colors">Courants d'air</Link>
          <span>/</span>
          <Link to={`/creators/${post.creator.id}`} className="hover:text-white transition-colors">
            {post.creator.displayName}
          </Link>
        </div>

        <div className="bg-[#111] rounded-2xl border border-[#2a2a2a] overflow-hidden">
          {/* Image floutée */}
          <div className="relative">
            <img
              src={post.image ?? undefined}
              alt={post.title}
              className="w-full object-cover max-h-[320px] blur-sm scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/70 flex flex-col items-center justify-center gap-3">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <span className="text-white text-lg font-bold">Contenu Haute Pression</span>
            </div>
          </div>

          {/* CTA */}
          <div className="p-8 flex flex-col items-center gap-5 text-center">
            <Link to={`/creators/${post.creator.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src={post.creator.avatar} alt={post.creator.displayName} className="w-12 h-12 rounded-full object-cover" />
              <div className="text-left">
                <div className="font-bold text-white">{post.creator.displayName}</div>
                <div className="text-sm text-[#8a8a8a]">@{post.creator.username}</div>
              </div>
            </Link>

            <div>
              <h2 className="text-xl font-bold text-white mb-1">{post.title}</h2>
              <p className="text-[#8a8a8a] text-sm">Ce souffle est réservé aux Souffleurs de {post.creator.displayName}.</p>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs">
              {token ? (
                <Link
                  to={`/subscribe/${post.creator.id}`}
                  className="bg-[#00AFF0] hover:bg-[#0099CC] text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors text-center"
                >
                  Rejoindre les Souffleurs — {post.creator.subscriptionPrice.toFixed(2)} €/mois
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="bg-[#00AFF0] hover:bg-[#0099CC] text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors text-center"
                >
                  Se connecter pour s'abonner
                </Link>
              )}
              <Link to="/feed" className="text-sm text-[#8a8a8a] hover:text-white transition-colors">
                ← Retour aux courants d'air
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">

      {/* Fil d'ariane */}
      <div className="flex items-center gap-2 text-sm text-[#8a8a8a]">
        <Link to="/feed" className="hover:text-white transition-colors">Courants d'air</Link>
        <span>/</span>
        <Link to={`/creators/${post.creator.id}`} className="hover:text-white transition-colors">
          {post.creator.displayName}
        </Link>
        <span>/</span>
        <span className="text-[#555] truncate">{post.title}</span>
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
          <div className="font-semibold text-white">{post.creator.displayName}</div>
          <div className="text-xs text-[#8a8a8a]">{post.creator.username}</div>
        </div>
      </Link>

      {/* Image */}
      <img
        src={post.image ?? undefined}
        alt={post.title}
        className="w-full rounded-2xl object-cover max-h-[480px]"
      />

      {/* Contenu */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-white">{post.title}</h1>
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-colors shrink-0 ${
              isLiked ? "text-red-500" : "text-[#555] hover:text-red-500"
            }`}
          >
            <svg className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <span className="font-semibold">{likes.toLocaleString("fr-FR")} rafales</span>
          </button>
        </div>

        <p className="text-[#8a8a8a] leading-relaxed">{post.description}</p>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-[#2a2a2a] text-[#8a8a8a] px-3 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="text-xs text-[#555]">
          Publié le {new Date(post.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

      {/* Commentaires */}
      <div className="bg-[#111] rounded-2xl border border-[#2a2a2a] p-6 flex flex-col gap-4">
        <h2 className="font-bold text-white">Commentaires ({comments.length})</h2>

        {token ? (
          <div className="flex flex-col gap-2">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Écrire un commentaire..."
              rows={2}
              className="input-of resize-none text-sm"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSubmitComment}
                disabled={isSubmitting || !newComment.trim()}
                className="bg-[#00AFF0] hover:bg-[#0099CC] disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
              >
                {isSubmitting ? "Envoi..." : "Commenter"}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#8a8a8a]">
            <Link to="/login" className="text-[#00AFF0] hover:underline">Connecte-toi</Link> pour commenter.
          </p>
        )}

        {comments.length === 0 ? (
          <p className="text-sm text-[#8a8a8a]">Soyez le premier à commenter !</p>
        ) : (
          <div className="flex flex-col gap-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3">
                {comment.avatar ? (
                  <img src={comment.avatar} alt={comment.username} className="w-8 h-8 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#00AFF0]/10 flex items-center justify-center text-xs font-bold text-[#00AFF0] shrink-0">
                    {comment.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-white text-sm">{comment.username}</span>
                    <span className="text-xs text-[#555]">
                      {new Date(comment.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <p className="text-sm text-[#8a8a8a] mt-0.5">{comment.content}</p>
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
