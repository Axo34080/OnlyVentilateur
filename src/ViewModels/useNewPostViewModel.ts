import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { createPost, updatePost, getMyPosts } from "../services/postService"

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
  error: string | null
  handleChange: (field: keyof PostForm, value: string | boolean) => void
  handleSubmit: () => Promise<void>
}

export function useNewPostViewModel(): NewPostViewModel {
  const { token } = useAuth()
  const navigate = useNavigate()
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

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError("Le titre est requis")
      return
    }
    if (!form.image.trim()) {
      setError("L'URL de l'image est requise")
      return
    }

    const dto = {
      title: form.title.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      isLocked: form.isLocked,
      price: form.isLocked && form.price ? parseFloat(form.price) : undefined,
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
      } else {
        await createPost(dto, token!)
      }
      navigate("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde")
    } finally {
      setIsSubmitting(false)
    }
  }

  return { form, isEditing, isSubmitting, error, handleChange, handleSubmit }
}
