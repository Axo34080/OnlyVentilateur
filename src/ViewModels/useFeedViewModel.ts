import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import { getLikedPostIds } from "../services/creatorsService"
import { getPosts } from "../services/postService"
import { getUserSubscriptions } from "../services/subscriptionService"
import type { Post } from "../types/Post"
import type { Creator } from "../types/Creator"

/**
 * Presentation: useFeedViewModel (pattern MVVM)
 *
 * Ce custom hook contient toute la logique du fil d'actualite :
 * chargement des posts, filtres, infinite scroll, likes.
 */
const POSTS_PER_BATCH = 9

type FeedFilter = 'nouveautes' | 'abonnements'

interface FeedViewModel {
  visiblePosts: Post[]
  getCreator: (creatorId: string) => Creator | undefined
  handleLike: (postId: string) => void
  isPostLiked: (postId: string) => boolean
  isCreatorSubscribed: (creatorId: string) => boolean
  isLoading: boolean
  isFetchingMore: boolean
  hasMore: boolean
  loadMore: () => void
  error: string | null
  filter: FeedFilter
  setFilter: (filter: FeedFilter) => void
}

export function useFeedViewModel(): FeedViewModel {
  const { token } = useAuth()
  const { showToast } = useToast()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [displayedCount, setDisplayedCount] = useState(POSTS_PER_BATCH)
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set())
  const [subscribedCreatorIds, setSubscribedCreatorIds] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<FeedFilter>('nouveautes')
  const creatorsMap = useRef<Map<string, Creator>>(new Map())

  useEffect(() => {
    if (!token) return
    getLikedPostIds(token)
      .then((ids) => setLikedPostIds(new Set(ids)))
      .catch(() => showToast("Impossible de charger tes likes.", "error"))
  }, [token, showToast])

  useEffect(() => {
    if (!token) return
    getUserSubscriptions(token)
      .then((ids) => setSubscribedCreatorIds(new Set(ids)))
      .catch(() => showToast("Impossible de charger tes abonnements.", "error"))
  }, [token, showToast])

  useEffect(() => {
    getPosts(token)
      .then(({ posts, creators }) => {
        creators.forEach((c) => creatorsMap.current.set(c.id, c))
        const sorted = [...posts].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setPosts(sorted)
      })
      .catch(() => setError("Une erreur est survenue lors du chargement. RÃ©essaie dans quelques instants."))
      .finally(() => setIsLoading(false))
  }, [token])

  const handleSetFilter = useCallback((newFilter: FeedFilter) => {
    setFilter(newFilter)
    setDisplayedCount(POSTS_PER_BATCH)
  }, [setFilter])

  // Recalcule uniquement si posts ou filter changent.
  const filteredPosts = useMemo(
    () => filter === 'abonnements'
      ? posts.filter((p) => subscribedCreatorIds.has(p.creatorId))
      : posts,
    [posts, filter, subscribedCreatorIds]
  )

  const hasMore = displayedCount < filteredPosts.length
  const visiblePosts = filteredPosts.slice(0, displayedCount)

  const loadMore = useCallback(() => {
    if (!hasMore || isFetchingMore) return
    setIsFetchingMore(true)
    // Simule un delai minimal pour eviter un flash brutal.
    setTimeout(() => {
      setDisplayedCount((prev) => prev + POSTS_PER_BATCH)
      setIsFetchingMore(false)
    }, 300)
  }, [hasMore, isFetchingMore])

  const getCreator = useCallback((creatorId: string) => creatorsMap.current.get(creatorId), [])

  const applyLikeResult = useCallback((postId: string, result: { likes: number; isLiked: boolean }) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, likes: result.likes } : p)))
    setLikedPostIds((prev) => {
      const next = new Set(prev)
      if (result.isLiked) next.add(postId)
      else next.delete(postId)
      return next
    })
  }, [])

  const revertLike = useCallback((postId: string, wasLiked: boolean) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, likes: wasLiked ? p.likes + 1 : Math.max(0, p.likes - 1) } : p
      )
    )
    setLikedPostIds((prev) => {
      const next = new Set(prev)
      if (wasLiked) next.add(postId)
      else next.delete(postId)
      return next
    })
  }, [])

  /**
   * Mise a jour optimiste :
   * 1. Mise a jour immediate de l'UI.
   * 2. Requete API en arriere-plan.
   * 3. Rollback si la requete echoue.
   */
  const handleLike = useCallback((postId: string) => {
    if (!token) return

    const wasLiked = likedPostIds.has(postId)

    // Etape 1 : mise a jour immediate de l'UI.
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, likes: wasLiked ? Math.max(0, p.likes - 1) : p.likes + 1 } : p
      )
    )
    setLikedPostIds((prev) => {
      const next = new Set(prev)
      if (wasLiked) next.delete(postId)
      else next.add(postId)
      return next
    })

    // Etape 2 : requete API en arriere-plan.
    fetch(`/api/posts/${postId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Like failed")
        return res.json()
      })
      .then((result: { likes: number; isLiked: boolean }) => applyLikeResult(postId, result))
      .catch(() => {
        revertLike(postId, wasLiked)
        showToast("Impossible de mettre a jour le like.", "error")
      })
  }, [applyLikeResult, likedPostIds, revertLike, showToast, token])

  const isPostLiked = useCallback((postId: string) => likedPostIds.has(postId), [likedPostIds])
  const isCreatorSubscribed = useCallback((creatorId: string) => subscribedCreatorIds.has(creatorId), [subscribedCreatorIds])

  return { visiblePosts, getCreator, handleLike, isPostLiked, isCreatorSubscribed, isLoading, isFetchingMore, hasMore, loadMore, error, filter, setFilter: handleSetFilter }
}
