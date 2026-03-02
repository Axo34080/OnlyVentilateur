import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { getMyPosts, deletePost } from "../services/postService"
import { getCreatorById } from "../services/creatorsService"
import type { Post } from "../types/Post"
import type { Creator } from "../types/Creator"

interface DashboardViewModel {
  creator: Creator | null
  posts: Post[]
  isLoading: boolean
  error: string | null
  handleDeletePost: (id: string) => Promise<void>
}

export function useDashboardViewModel(): DashboardViewModel {
  const { token, user } = useAuth()
  const [creator, setCreator] = useState<Creator | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || !user?.creatorId) return

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [myPosts, creatorData] = await Promise.all([
          getMyPosts(token),
          getCreatorById(user.creatorId!),
        ])
        setPosts(myPosts)
        setCreator(creatorData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement")
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [token, user?.creatorId])

  const handleDeletePost = async (id: string) => {
    if (!token) return
    try {
      await deletePost(id, token)
      setPosts((prev) => prev.filter((p) => p.id !== id))
    } catch {
      // silently fail — on pourrait afficher une notif toast ici
    }
  }

  return { creator, posts, isLoading, error, handleDeletePost }
}
