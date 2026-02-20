import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { getCreatorById } from "../services/creatorsService"
import { subscribe, unsubscribe, getUserSubscriptions } from "../services/subscriptionService"
import type { Creator } from "../types/Creator"
import type { Post } from "../types/Post"

interface CreatorProfileViewModel {
  creator: Creator | null
  posts: Post[]
  isSubscribed: boolean
  isLoading: boolean
  error: string | null
  handleSubscribe: () => Promise<void>
  handleLike: (postId: string) => void
}

export function useCreatorProfileViewModel(creatorId: string): CreatorProfileViewModel {
  const { token } = useAuth()

  const [creator, setCreator] = useState<Creator | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    if (!token) return
    getUserSubscriptions(token)
      .then((ids) => setIsSubscribed(ids.includes(creatorId)))
      .catch(() => {})
  }, [token, creatorId])

  const handleSubscribe = async () => {
    if (!token) return
    try {
      if (isSubscribed) {
        await unsubscribe(creatorId, token)
        setIsSubscribed(false)
      } else {
        await subscribe(creatorId, token)
        setIsSubscribed(true)
      }
    } catch {
      // silently fail — l'UI reste cohérente
    }
  }

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
    )
    if (token) {
      fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {})
    }
  }

  return { creator, posts, isSubscribed, isLoading, error, handleSubscribe, handleLike }
}
