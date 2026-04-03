import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useAuth } from "../context/AuthContext"
import { getLikedPostIds } from "../services/creatorsService"
import { getPosts } from "../services/postService"
import { getUserSubscriptions } from "../services/subscriptionService"
import type { Post } from "../types/Post"
import type { Creator } from "../types/Creator"

/**
 * PRÉSENTATION — useFeedViewModel (pattern MVVM)
 *
 * Ce custom hook contient TOUTE la logique du fil d'actualité :
 * chargement des posts, filtres, infinite scroll, likes.
 * La vue Feed.tsx ne contient que du JSX — zéro logique métier.
 *
 * Concepts illustrés : useState, useEffect, useCallback, useMemo,
 * Intersection Observer, mises à jour optimistes avec rollback.
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
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [displayedCount, setDisplayedCount] = useState(POSTS_PER_BATCH)
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set())
  const [subscribedCreatorIds, setSubscribedCreatorIds] = useState<Set<string>>(new Set())
  const [filter, setFilterState] = useState<FeedFilter>('nouveautes')
  const creatorsMap = useRef<Map<string, Creator>>(new Map())

  useEffect(() => {
    if (!token) return
    getLikedPostIds(token)
      .then((ids) => setLikedPostIds(new Set(ids)))
      .catch(() => {})
  }, [token])

  useEffect(() => {
    if (!token) return
    getUserSubscriptions(token)
      .then((ids) => setSubscribedCreatorIds(new Set(ids)))
      .catch(() => {})
  }, [token])

  useEffect(() => {
    getPosts(token)
      .then(({ posts, creators }) => {
        creators.forEach((c) => creatorsMap.current.set(c.id, c))
        const sorted = [...posts].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setPosts(sorted)
      })
      .catch(() => setError("Une erreur est survenue lors du chargement. Réessaie dans quelques instants."))
      .finally(() => setIsLoading(false))
  }, [token])

  const setFilter = useCallback((newFilter: FeedFilter) => {
    setFilterState(newFilter)
    setDisplayedCount(POSTS_PER_BATCH)
  }, [])

  // useMemo : recalcule uniquement si posts ou filter changent (pas à chaque render)
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
    // Simule un délai minimal pour éviter un flash brutal
    setTimeout(() => {
      setDisplayedCount((prev) => prev + POSTS_PER_BATCH)
      setIsFetchingMore(false)
    }, 300)
  }, [hasMore, isFetchingMore])

  const getCreator = (creatorId: string) => creatorsMap.current.get(creatorId)

  const applyLikeResult = (postId: string, result: { likes: number; isLiked: boolean }) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, likes: result.likes } : p)))
    setLikedPostIds((prev) => {
      const next = new Set(prev)
      if (result.isLiked) next.add(postId)
      else next.delete(postId)
      return next
    })
  }

  const revertLike = (postId: string, wasLiked: boolean) => {
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
  }

  /**
   * PRÉSENTATION — Mise à jour optimiste (Optimistic UI)
   *
   * 1. On met à jour l'UI immédiatement (sans attendre le serveur) → réactivité
   * 2. On envoie la requête en arrière-plan
   * 3. Si la requête échoue → on revient à l'état précédent (rollback)
   *
   * L'utilisateur ne ressent aucune latence, mais l'état reste cohérent.
   */
  const handleLike = (postId: string) => {
    if (!token) return

    const wasLiked = likedPostIds.has(postId)

    // Étape 1 : mise à jour immédiate de l'UI
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

    // Étape 2 : requête API en arrière-plan
    fetch(`/api/posts/${postId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Like failed")
        return res.json()
      })
      .then((result: { likes: number; isLiked: boolean }) => applyLikeResult(postId, result))
      .catch(() => revertLike(postId, wasLiked)) // Étape 3 : rollback si erreur
  }

  const isPostLiked = (postId: string) => likedPostIds.has(postId)
  const isCreatorSubscribed = (creatorId: string) => subscribedCreatorIds.has(creatorId)

  return { visiblePosts, getCreator, handleLike, isPostLiked, isCreatorSubscribed, isLoading, isFetchingMore, hasMore, loadMore, error, filter, setFilter }
}
