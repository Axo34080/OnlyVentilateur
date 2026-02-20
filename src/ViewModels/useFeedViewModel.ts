import { useState, useEffect, useRef } from "react"
import { useAuth } from "../context/AuthContext"
import type { Post } from "../types/Post"
import type { Creator } from "../types/Creator"

interface FeedViewModel {
  posts: Post[]
  getCreator: (creatorId: string) => Creator | undefined
  handleLike: (postId: string) => void
  isLoading: boolean
}

export function useFeedViewModel(): FeedViewModel {
  const { token } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const creatorsMap = useRef<Map<string, Creator>>(new Map())

  useEffect(() => {
    setIsLoading(true)
    fetch("/api/posts")
      .then((res) => res.json())
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
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const getCreator = (creatorId: string) => creatorsMap.current.get(creatorId)

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

  return { posts, getCreator, handleLike, isLoading }
}
