import { useState, useEffect, useRef } from "react"
import { useAuth } from "../context/AuthContext"
import { getLikedPostIds } from "../services/creatorsService"
import type { Post } from "../types/Post"
import type { Creator } from "../types/Creator"

const POSTS_PER_PAGE = 9

interface FeedViewModel {
  paginatedPosts: Post[]
  getCreator: (creatorId: string) => Creator | undefined
  handleLike: (postId: string) => void
  isPostLiked: (postId: string) => boolean
  isLoading: boolean
  error: string | null
  page: number
  totalPages: number
  setPage: (page: number) => void
}

export function useFeedViewModel(): FeedViewModel {
  const { token } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set())
  const creatorsMap = useRef<Map<string, Creator>>(new Map())

  useEffect(() => {
    if (!token) return
    getLikedPostIds(token)
      .then((ids) => setLikedPostIds(new Set(ids)))
      .catch(() => {})
  }, [token])

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((data: any[]) => {
        const mapped: Post[] = data.map((p) => ({
          id: p.id,
          creatorId: p.creator?.id ?? "",
          title: p.title,
          description: p.description,
          image: p.image,
          isLocked: p.isLocked,
          price: p.price != null ? parseFloat(p.price) : undefined,
          likes: p.likes,
          tags: p.tags ?? [],
          createdAt: p.createdAt,
        }))

        data.forEach((p) => {
          if (p.creator && !creatorsMap.current.has(p.creator.id)) {
            creatorsMap.current.set(p.creator.id, {
              id: p.creator.id,
              username: p.creator.username,
              displayName: p.creator.displayName,
              avatar: p.creator.avatar ?? "",
              coverImage: p.creator.coverImage ?? "",
              bio: p.creator.bio ?? "",
              subscriptionPrice: parseFloat(p.creator.subscriptionPrice),
              isPremium: p.creator.isPremium,
            })
          }
        })

        setPosts(mapped)
      })
      .catch(() => setError("Une erreur est survenue lors du chargement. Réessaie dans quelques instants."))
      .finally(() => setIsLoading(false))
  }, [])

  const getCreator = (creatorId: string) => creatorsMap.current.get(creatorId)

  const handleLike = (postId: string) => {
    if (!token) return

    const wasLiked = likedPostIds.has(postId)

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

    fetch(`/api/posts/${postId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((result: { likes: number; isLiked: boolean }) => {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, likes: result.likes } : p))
        )
        setLikedPostIds((prev) => {
          const next = new Set(prev)
          if (result.isLiked) next.add(postId)
          else next.delete(postId)
          return next
        })
      })
      .catch(() => {
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
      })
  }

  const isPostLiked = (postId: string) => likedPostIds.has(postId)

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)
  const paginatedPosts = posts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE)

  return { paginatedPosts, getCreator, handleLike, isPostLiked, isLoading, error, page, totalPages, setPage }
}
