import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { getCreatorById, getLikedPostIds } from "../services/creatorsService"
import { subscribe, unsubscribe, getUserSubscriptions } from "../services/subscriptionService"
import type { Creator } from "../types/Creator"
import type { Post } from "../types/Post"

interface CreatorProfileViewModel {
  creator: Creator | null
  posts: Post[]
  isSubscribed: boolean
  isCheckingSubscription: boolean
  isLoading: boolean
  error: string | null
  handleSubscribe: () => Promise<void>
  handleLike: (postId: string) => void
  isPostLiked: (postId: string) => boolean
}

export function useCreatorProfileViewModel(creatorId: string): CreatorProfileViewModel {
  const { token } = useAuth()
  const navigate = useNavigate()

  const [creator, setCreator] = useState<Creator | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(!!token)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    getCreatorById(creatorId)
      .then((data) => {
        if (cancelled) return
        setCreator({ ...data })
        setPosts(data.posts)
      })
      .catch(() => {
        if (!cancelled) setError("Impossible de charger ce créateur")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [creatorId])

  useEffect(() => {
    if (!token) {
      setIsCheckingSubscription(false)
      return
    }
    setIsCheckingSubscription(true)
    getUserSubscriptions(token)
      .then((ids) => setIsSubscribed(ids.includes(creatorId)))
      .catch(() => {})
      .finally(() => setIsCheckingSubscription(false))
  }, [token, creatorId])

  useEffect(() => {
    if (!token) return
    getLikedPostIds(token)
      .then((ids) => setLikedPostIds(new Set(ids)))
      .catch(() => {})
  }, [token])

  const handleSubscribe = async () => {
    if (!token) {
      navigate("/login")
      return
    }
    try {
      if (isSubscribed) {
        await unsubscribe(creatorId, token)
        setIsSubscribed(false)
        setCreator((prev) =>
          prev ? { ...prev, subscriberCount: Math.max(0, (prev.subscriberCount ?? 1) - 1) } : prev
        )
      } else {
        await subscribe(creatorId, token)
        setIsSubscribed(true)
        setCreator((prev) =>
          prev ? { ...prev, subscriberCount: (prev.subscriberCount ?? 0) + 1 } : prev
        )
      }
    } catch {
      // silently fail
    }
  }

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

  return { creator, posts, isSubscribed, isCheckingSubscription, isLoading, error, handleSubscribe, handleLike, isPostLiked }
}
