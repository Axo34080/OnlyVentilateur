import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { becomeCreator } from "../services/postService"

interface BecomeCreatorForm {
  displayName: string
  bio: string
  subscriptionPrice: string
}

interface BecomeCreatorViewModel {
  form: BecomeCreatorForm
  isSubmitting: boolean
  error: string | null
  handleChange: (field: keyof BecomeCreatorForm, value: string) => void
  handleSubmit: () => Promise<void>
}

export function useBecomeCreatorViewModel(): BecomeCreatorViewModel {
  const { token, updateUser } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState<BecomeCreatorForm>({
    displayName: "",
    bio: "",
    subscriptionPrice: "4.99",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: keyof BecomeCreatorForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!form.displayName.trim()) {
      setError("Le nom d'affichage est requis")
      return
    }
    const price = parseFloat(form.subscriptionPrice)
    if (isNaN(price) || price < 0) {
      setError("Le prix doit être un nombre positif")
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      const result = await becomeCreator(
        {
          displayName: form.displayName.trim(),
          bio: form.bio.trim(),
          subscriptionPrice: price,
        },
        token!
      )
      updateUser({ creatorId: result.creatorId })
      navigate("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création")
    } finally {
      setIsSubmitting(false)
    }
  }

  return { form, isSubmitting, error, handleChange, handleSubmit }
}
