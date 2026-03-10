import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import { createPost, updatePost, getMyPosts } from "../services/postService"
import { uploadFile } from "../services/uploadService"

interface PostForm {
  title: string
  description: string
  image: string
  isLocked: boolean
  price: string
  tags: string
}

interface NewPostViewModel {
  form: PostForm
  isEditing: boolean
  isSubmitting: boolean
  isUploadingImage: boolean
  error: string | null
  handleChange: (field: keyof PostForm, value: string | boolean) => void
  handleImageFileChange: (file: File) => Promise<void>
  handleSubmit: () => Promise<void>
}

export function useNewPostViewModel(): NewPostViewModel {
  const { token } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { id } = useParams<{ id?: string }>()
  const isEditing = !!id

  const [form, setForm] = useState<PostForm>({
    title: "",
    description: "",
    image: "",
    isLocked: false,
    price: "",
    tags: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // En mode édition, charger les données du post existant
  useEffect(() => {
    if (!isEditing || !token || !id) return
    getMyPosts(token)
      .then((posts) => {
        const post = posts.find((p) => p.id === id)
        if (post) {
          setForm({
            title: post.title,
            description: post.description,
            image: post.image,
            isLocked: post.isLocked,
            price: post.price?.toString() ?? "",
            tags: post.tags.join(", "),
          })
        }
      })
      .catch(() => {})
  }, [id, isEditing, token])

  const handleChange = (field: keyof PostForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageFileChange = async (file: File) => {
    if (!token) return
    setIsUploadingImage(true)
    setError(null)
    try {
      const url = await uploadFile(file, token)
      setForm((prev) => ({ ...prev, image: url }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du téléversement")
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError("Le titre est requis")
      return
    }
    if (!form.image.trim()) {
      setError("L'image est requise")
      return
    }

    const dto = {
      title: form.title.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      isLocked: form.isLocked,
      price: form.isLocked && form.price ? Number.parseFloat(form.price) : undefined,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    }

    setIsSubmitting(true)
    setError(null)
    try {
      if (isEditing && id) {
        await updatePost(id, dto, token!)
        showToast("Post modifié !", "success")
      } else {
        await createPost(dto, token!)
        showToast("Post publié !", "success")
      }
      navigate("/dashboard")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la sauvegarde"
      setError(msg)
      showToast(msg, "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return { form, isEditing, isSubmitting, isUploadingImage, error, handleChange, handleImageFileChange, handleSubmit }
}
