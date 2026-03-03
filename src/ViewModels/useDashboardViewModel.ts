import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { getMyPosts, deletePost } from "../services/postService"
import { getCreatorById } from "../services/creatorsService"
import { getGoodies, createGoodie, updateGoodie, deleteGoodie } from "../services/goodiesService"
import type { Post } from "../types/Post"
import type { Creator } from "../types/Creator"
import type { Goodie } from "../services/goodiesService"

interface GoodieForm {
  name: string
  description: string
  price: string
  image: string
  inStock: boolean
}

const emptyForm: GoodieForm = { name: "", description: "", price: "", image: "", inStock: true }

interface DashboardViewModel {
  creator: Creator | null
  posts: Post[]
  isLoading: boolean
  error: string | null
  handleDeletePost: (id: string) => Promise<void>
  // Goodies
  goodies: Goodie[]
  goodiesLoading: boolean
  goodieForm: GoodieForm
  editingGoodieId: string | null
  isSavingGoodie: boolean
  handleGoodieFormChange: (field: keyof GoodieForm, value: string | boolean) => void
  handleEditGoodie: (goodie: Goodie) => void
  handleCancelGoodie: () => void
  handleSaveGoodie: () => Promise<void>
  handleDeleteGoodie: (id: string) => Promise<void>
  handleNewGoodie: () => void
}

export function useDashboardViewModel(): DashboardViewModel {
  const { token, user } = useAuth()
  const [creator, setCreator] = useState<Creator | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [goodies, setGoodies] = useState<Goodie[]>([])
  const [goodiesLoading, setGoodiesLoading] = useState(true)
  const [goodieForm, setGoodieForm] = useState<GoodieForm>(emptyForm)
  const [editingGoodieId, setEditingGoodieId] = useState<string | null>(null)
  const [isSavingGoodie, setIsSavingGoodie] = useState(false)

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

  useEffect(() => {
    if (!token || !user?.creatorId) return
    setGoodiesLoading(true)
    getGoodies(user.creatorId)
      .then(setGoodies)
      .catch(() => {})
      .finally(() => setGoodiesLoading(false))
  }, [token, user?.creatorId])

  const handleDeletePost = async (id: string) => {
    if (!token) return
    try {
      await deletePost(id, token)
      setPosts((prev) => prev.filter((p) => p.id !== id))
    } catch {
      // silently fail
    }
  }

  const handleGoodieFormChange = (field: keyof GoodieForm, value: string | boolean) => {
    setGoodieForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleNewGoodie = () => {
    setGoodieForm(emptyForm)
    setEditingGoodieId(null)
  }

  const handleEditGoodie = (goodie: Goodie) => {
    setGoodieForm({
      name: goodie.name,
      description: goodie.description ?? "",
      price: String(goodie.price),
      image: goodie.image,
      inStock: goodie.inStock,
    })
    setEditingGoodieId(goodie.id)
  }

  const handleCancelGoodie = () => {
    setGoodieForm(emptyForm)
    setEditingGoodieId(null)
  }

  const handleSaveGoodie = async () => {
    if (!token) return
    setIsSavingGoodie(true)
    try {
      const data = {
        name: goodieForm.name,
        description: goodieForm.description || undefined,
        price: Number.parseFloat(goodieForm.price),
        image: goodieForm.image,
        inStock: goodieForm.inStock,
      }
      if (editingGoodieId) {
        const updated = await updateGoodie(editingGoodieId, data, token)
        setGoodies((prev) => prev.map((g) => (g.id === editingGoodieId ? updated : g)))
      } else {
        const created = await createGoodie(data, token)
        setGoodies((prev) => [...prev, created])
      }
      setGoodieForm(emptyForm)
      setEditingGoodieId(null)
    } catch {
      // silently fail
    } finally {
      setIsSavingGoodie(false)
    }
  }

  const handleDeleteGoodie = async (id: string) => {
    if (!token) return
    try {
      await deleteGoodie(id, token)
      setGoodies((prev) => prev.filter((g) => g.id !== id))
    } catch {
      // silently fail
    }
  }

  return {
    creator, posts, isLoading, error, handleDeletePost,
    goodies, goodiesLoading, goodieForm, editingGoodieId, isSavingGoodie,
    handleGoodieFormChange, handleEditGoodie, handleCancelGoodie,
    handleSaveGoodie, handleDeleteGoodie, handleNewGoodie,
  }
}
