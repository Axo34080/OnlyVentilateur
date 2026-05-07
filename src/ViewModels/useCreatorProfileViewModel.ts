import { useState, useEffect } from "react"

function toggleInSet(prev: Set<string>, id: string, shouldAdd: boolean): Set<string> {
  const next = new Set(prev)
  if (shouldAdd) next.add(id)
  else next.delete(id)
  return next
}

function updatePostLikes(postId: string, likes: number) {
  return (p: Post): Post => (p.id === postId ? { ...p, likes } : p)
}

function revertPostLikes(postId: string, wasLiked: boolean) {
  return (p: Post): Post => {
    if (p.id !== postId) return p
    return { ...p, likes: wasLiked ? p.likes + 1 : Math.max(0, p.likes - 1) }
  }
}
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import { getCreatorById, getLikedPostIds } from "../services/creatorsService"
import { unsubscribe, getUserSubscriptions, getSubscribedCreators } from "../services/subscriptionService"
import { getGoodies } from "../services/goodiesService"
import type { Goodie } from "../services/goodiesService"
import type { Creator } from "../types/Creator"
import type { Post } from "../types/Post"

interface CreatorProfileViewModel {
  creator: Creator | null
  posts: Post[]
  goodies: Goodie[]
  isSubscribed: boolean
  isCheckingSubscription: boolean
  isLoading: boolean
  isOwnProfile: boolean
  error: string | null
  subscriptions: Creator[]
  handleUnsubscribeFromCreator: (targetId: string) => Promise<void>
  handleSubscribe: () => Promise<void>
  handleLike: (postId: string) => void
  isPostLiked: (postId: string) => boolean
}

export function useCreatorProfileViewModel(creatorId: string): CreatorProfileViewModel {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [creator, setCreator] = useState<Creator | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(!!token)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set())
  const [subscriptions, setSubscriptions] = useState<Creator[]>([])
  const [goodies, setGoodies] = useState<Goodie[]>([])

  const isOwnProfile = !!user?.creatorId && user.creatorId === creatorId

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

  useEffect(() => {
    if (!token || !user?.creatorId || user.creatorId !== creatorId) return
    getSubscribedCreators(token).then(setSubscriptions).catch(() => {})
  }, [token, user?.creatorId, creatorId])

  useEffect(() => {
    if (!creatorId) return
    getGoodies(creatorId).then(setGoodies).catch(() => {})
  }, [creatorId])

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
        showToast("Désabonné", "info")
      } else {
        navigate(`/subscribe/${creatorId}`)
        return
      }
    } catch {
      showToast("Erreur lors de l'abonnement", "error")
    }
  }

  const handleLike = (postId: string) => {
    if (!token) return
    if (!/^[a-zA-Z0-9_-]+$/.test(postId)) return

    const wasLiked = likedPostIds.has(postId)

    setPosts((prev) => prev.map(revertPostLikes(postId, !wasLiked)))
    setLikedPostIds((prev) => toggleInSet(prev, postId, !wasLiked))

    fetch(`/api/posts/${postId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Like failed")
        return res.json()
      })
      .then((result: { likes: number; isLiked: boolean }) => {
        setPosts((prev) => prev.map(updatePostLikes(postId, result.likes)))
        setLikedPostIds((prev) => toggleInSet(prev, postId, result.isLiked))
      })
      .catch(() => {
        setPosts((prev) => prev.map(revertPostLikes(postId, wasLiked)))
        setLikedPostIds((prev) => toggleInSet(prev, postId, wasLiked))
      })
  }

  const isPostLiked = (postId: string) => likedPostIds.has(postId)

  const handleUnsubscribeFromCreator = async (targetId: string) => {
    if (!token) return
    try {
      await unsubscribe(targetId, token)
      setSubscriptions((prev) => prev.filter((c) => c.id !== targetId))
      showToast("Désabonné", "info")
    } catch {
      showToast("Erreur lors du désabonnement", "error")
    }
  }

  return {
    creator, posts, goodies, isSubscribed, isCheckingSubscription, isLoading, error, isOwnProfile,
    subscriptions, handleUnsubscribeFromCreator, handleSubscribe, handleLike, isPostLiked,
  }
}
