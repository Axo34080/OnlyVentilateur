import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import { getMyPosts, deletePost } from "../services/postService"
import { getCreatorById } from "../services/creatorsService"
import { getGoodies, createGoodie, updateGoodie, deleteGoodie } from "../services/goodiesService"
import { uploadFile } from "../services/uploadService"
import type { Post } from "../types/Post"
import type { Creator } from "../types/Creator"
import type { Goodie } from "../services/goodiesService"

interface GoodieForm {
  name: string
  description: string
  price: string
  image: string
  inStock: boolean
  variants: string
}

const emptyForm: GoodieForm = { name: "", description: "", price: "", image: "", inStock: true, variants: "" }

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
  newGoodieOpen: boolean
  isSavingGoodie: boolean
  isUploadingGoodieImage: boolean
  handleGoodieImageFile: (file: File) => Promise<void>
  handleGoodieFormChange: (field: keyof GoodieForm, value: string | boolean) => void
  handleEditGoodie: (goodie: Goodie) => void
  handleCancelGoodie: () => void
  handleSaveGoodie: () => Promise<void>
  handleDeleteGoodie: (id: string) => Promise<void>
  handleNewGoodie: () => void
}

export function useDashboardViewModel(): DashboardViewModel {
  const { token, user } = useAuth()
  const { showToast } = useToast()
  const [creator, setCreator] = useState<Creator | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [goodies, setGoodies] = useState<Goodie[]>([])
  const [goodiesLoading, setGoodiesLoading] = useState(true)
  const [goodieForm, setGoodieForm] = useState<GoodieForm>(emptyForm)
  const [editingGoodieId, setEditingGoodieId] = useState<string | null>(null)
  const [newGoodieOpen, setNewGoodieOpen] = useState(false)
  const [isSavingGoodie, setIsSavingGoodie] = useState(false)
  const [isUploadingGoodieImage, setIsUploadingGoodieImage] = useState(false)

  useEffect(() => {
    if (!token) return
    if (!user?.creatorId) {
      setCreator(null)
      setPosts([])
      setIsLoading(false)
      setError("Espace réservé aux créateurs")
      return
    }

    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [myPosts, creatorData] = await Promise.all([
          getMyPosts(token),
          getCreatorById(user.creatorId!),
        ])
        if (!cancelled) {
          setPosts(myPosts)
          setCreator(creatorData)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erreur de chargement")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [token, user?.creatorId])

  useEffect(() => {
    if (!token) return
    if (!user?.creatorId) {
      setGoodies([])
      setGoodiesLoading(false)
      return
    }
    setGoodiesLoading(true)
    getGoodies(user.creatorId)
      .then(setGoodies)
      .catch(() => showToast("Impossible de charger les goodies.", "error"))
      .finally(() => setGoodiesLoading(false))
  }, [token, user?.creatorId, showToast])

  const handleDeletePost = async (id: string) => {
    if (!token) return
    try {
      await deletePost(id, token)
      setPosts((prev) => prev.filter((p) => p.id !== id))
      showToast("Post supprimé", "info")
    } catch {
      showToast("Erreur lors de la suppression", "error")
    }
  }

  const handleGoodieImageFile = async (file: File) => {
    if (!token) return
    setIsUploadingGoodieImage(true)
    try {
      const url = await uploadFile(file, token)
      setGoodieForm((prev) => ({ ...prev, image: url }))
    } catch {
      showToast("Erreur lors du tÃ©lÃ©versement de l'image", "error")
    } finally {
      setIsUploadingGoodieImage(false)
    }
  }

  const handleGoodieFormChange = (field: keyof GoodieForm, value: string | boolean) => {
    setGoodieForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleNewGoodie = () => {
    setGoodieForm(emptyForm)
    setEditingGoodieId(null)
    setNewGoodieOpen(true)
  }

  const handleEditGoodie = (goodie: Goodie) => {
    setGoodieForm({
      name: goodie.name,
      description: goodie.description ?? "",
      price: String(goodie.price),
      image: goodie.image,
      inStock: goodie.inStock,
      variants: goodie.variants?.join(", ") ?? "",
    })
    setEditingGoodieId(goodie.id)
    setNewGoodieOpen(false)
  }

  const handleCancelGoodie = () => {
    setGoodieForm(emptyForm)
    setEditingGoodieId(null)
    setNewGoodieOpen(false)
  }

  const handleSaveGoodie = async () => {
    if (!token) return
    const price = Number.parseFloat(goodieForm.price)
    if (Number.isNaN(price)) {
      showToast("Prix du goodie invalide", "error")
      return
    }
    setIsSavingGoodie(true)
    try {
      const parsedVariants = goodieForm.variants
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
      const data = {
        name: goodieForm.name,
        description: goodieForm.description || undefined,
        price,
        image: goodieForm.image,
        inStock: goodieForm.inStock,
        variants: parsedVariants.length > 0 ? parsedVariants : undefined,
      }
      if (editingGoodieId) {
        const updated = await updateGoodie(editingGoodieId, data, token)
        setGoodies((prev) => prev.map((g) => (g.id === editingGoodieId ? updated : g)))
      } else {
        const created = await createGoodie(data, token)
        setGoodies((prev) => [...prev, created])
      }
      showToast(editingGoodieId ? "Goodie mis à jour" : "Goodie ajouté !", "success")
      setGoodieForm(emptyForm)
      setEditingGoodieId(null)
      setNewGoodieOpen(false)
    } catch {
      showToast("Erreur lors de la sauvegarde du goodie", "error")
    } finally {
      setIsSavingGoodie(false)
    }
  }

  const handleDeleteGoodie = async (id: string) => {
    if (!token) return
    try {
      await deleteGoodie(id, token)
      setGoodies((prev) => prev.filter((g) => g.id !== id))
      showToast("Goodie supprimé", "info")
    } catch {
      showToast("Erreur lors de la suppression", "error")
    }
  }

  return {
    creator, posts, isLoading, error, handleDeletePost,
    goodies, goodiesLoading, goodieForm, editingGoodieId, newGoodieOpen, isSavingGoodie,
    isUploadingGoodieImage, handleGoodieImageFile,
    handleGoodieFormChange, handleEditGoodie, handleCancelGoodie,
    handleSaveGoodie, handleDeleteGoodie, handleNewGoodie,
  }
}
