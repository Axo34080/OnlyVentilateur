import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import { getSubscribedCreators, unsubscribe } from "../services/subscriptionService"
import type { Creator } from "../types/Creator"

interface ProfileForm {
  username: string
  bio: string
  avatar: string
}

interface CreatorForm {
  displayName: string
  coverImage: string
  subscriptionPrice: string
}

interface UserProfileViewModel {
  user: ReturnType<typeof useAuth>["user"]
  form: ProfileForm
  creatorForm: CreatorForm
  creatorData: Creator | null
  isEditing: boolean
  isEditingCreator: boolean
  isSaving: boolean
  isSavingCreator: boolean
  error: string | null
  creatorError: string | null
  subscriptions: Creator[]
  handleEdit: () => void
  handleCancel: () => void
  handleSave: () => Promise<void>
  handleChange: (field: Exclude<keyof ProfileForm, "avatar">, value: string) => void
  handleAvatarChange: (file: File) => void
  handleUnsubscribe: (creatorId: string) => Promise<void>
  handleEditCreator: () => void
  handleCancelCreator: () => void
  handleSaveCreator: () => Promise<void>
  handleCreatorChange: (field: keyof CreatorForm, value: string) => void
}

export function useUserProfileViewModel(): UserProfileViewModel {
  const { user, token, updateUser } = useAuth()
  const { showToast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [subscriptions, setSubscriptions] = useState<Creator[]>([])
  const [form, setForm] = useState<ProfileForm>({
    username: user?.username ?? "",
    bio: user?.bio ?? "",
    avatar: user?.avatar ?? "",
  })

  // État créateur
  const [creatorData, setCreatorData] = useState<Creator | null>(null)
  const [isEditingCreator, setIsEditingCreator] = useState(false)
  const [isSavingCreator, setIsSavingCreator] = useState(false)
  const [creatorError, setCreatorError] = useState<string | null>(null)
  const [creatorForm, setCreatorForm] = useState<CreatorForm>({
    displayName: "",
    coverImage: "",
    subscriptionPrice: "",
  })

  useEffect(() => {
    if (!token) return
    getSubscribedCreators(token)
      .then(setSubscriptions)
      .catch(() => {})
  }, [token])

  // Charger le profil créateur si l'utilisateur en est un
  useEffect(() => {
    if (!token || !user?.creatorId) return
    fetch("/api/creators/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setCreatorData(data)
        setCreatorForm({
          displayName: data.displayName ?? "",
          coverImage: data.coverImage ?? "",
          subscriptionPrice: String(data.subscriptionPrice ?? ""),
        })
      })
      .catch(() => {})
  }, [token, user?.creatorId])

  const handleUnsubscribe = async (creatorId: string) => {
    if (!token) return
    try {
      await unsubscribe(creatorId, token)
      setSubscriptions((prev) => prev.filter((c) => c.id !== creatorId))
      showToast("Désabonné", "info")
    } catch {
      showToast("Erreur lors du désabonnement", "error")
    }
  }

  const handleEdit = () => {
    setForm({
      username: user?.username ?? "",
      bio: user?.bio ?? "",
      avatar: user?.avatar ?? "",
    })
    setIsEditing(true)
    setError(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setError(null)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: form.username,
          bio: form.bio || undefined,
          avatar: form.avatar || undefined,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message ?? "Erreur lors de la sauvegarde")
      }
      const updated = await res.json()
      updateUser({ username: updated.username, bio: updated.bio, avatar: updated.avatar })
      // Mettre à jour les données créateur localement (avatar/bio syncés)
      if (creatorData) {
        setCreatorData((prev) => prev ? { ...prev, avatar: updated.avatar ?? prev.avatar, bio: updated.bio ?? prev.bio } : prev)
      }
      setIsEditing(false)
      showToast("Profil mis à jour", "success")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la sauvegarde"
      setError(msg)
      showToast(msg, "error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (field: Exclude<keyof ProfileForm, "avatar">, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleAvatarChange = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      setForm((prev) => ({ ...prev, avatar: base64 }))
      setIsEditing(true)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  // Créateur
  const handleEditCreator = () => {
    setCreatorForm({
      displayName: creatorData?.displayName ?? "",
      coverImage: creatorData?.coverImage ?? "",
      subscriptionPrice: String(creatorData?.subscriptionPrice ?? ""),
    })
    setIsEditingCreator(true)
    setCreatorError(null)
  }

  const handleCancelCreator = () => {
    setIsEditingCreator(false)
    setCreatorError(null)
  }

  const handleSaveCreator = async () => {
    setIsSavingCreator(true)
    setCreatorError(null)
    try {
      const res = await fetch("/api/creators/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName: creatorForm.displayName || undefined,
          coverImage: creatorForm.coverImage || undefined,
          subscriptionPrice: creatorForm.subscriptionPrice
            ? Number.parseFloat(creatorForm.subscriptionPrice)
            : undefined,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message ?? "Erreur lors de la sauvegarde")
      }
      const updated = await res.json()
      setCreatorData((prev) => prev ? { ...prev, ...updated } : updated)
      setIsEditingCreator(false)
      showToast("Profil créateur mis à jour", "success")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la sauvegarde"
      setCreatorError(msg)
      showToast(msg, "error")
    } finally {
      setIsSavingCreator(false)
    }
  }

  const handleCreatorChange = (field: keyof CreatorForm, value: string) => {
    setCreatorForm((prev) => ({ ...prev, [field]: value }))
  }

  return {
    user, form, creatorForm, creatorData,
    isEditing, isEditingCreator, isSaving, isSavingCreator,
    error, creatorError, subscriptions,
    handleEdit, handleCancel, handleSave, handleChange, handleAvatarChange, handleUnsubscribe,
    handleEditCreator, handleCancelCreator, handleSaveCreator, handleCreatorChange,
  }
}
