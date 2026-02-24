import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { getSubscribedCreators, unsubscribe } from "../services/subscriptionService"
import type { Creator } from "../types/Creator"

interface ProfileForm {
  username: string
  bio: string
  avatar: string
}

interface UserProfileViewModel {
  user: ReturnType<typeof useAuth>["user"]
  form: ProfileForm
  isEditing: boolean
  isSaving: boolean
  error: string | null
  subscriptions: Creator[]
  handleEdit: () => void
  handleCancel: () => void
  handleSave: () => Promise<void>
  handleChange: (field: Exclude<keyof ProfileForm, "avatar">, value: string) => void
  handleAvatarChange: (file: File) => void
  handleUnsubscribe: (creatorId: string) => Promise<void>
}

export function useUserProfileViewModel(): UserProfileViewModel {
  const { user, token, updateUser } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [subscriptions, setSubscriptions] = useState<Creator[]>([])
  const [form, setForm] = useState<ProfileForm>({
    username: user?.username ?? "",
    bio: user?.bio ?? "",
    avatar: user?.avatar ?? "",
  })

  useEffect(() => {
    if (!token) return
    getSubscribedCreators(token)
      .then(setSubscriptions)
      .catch(() => {})
  }, [token])

  const handleUnsubscribe = async (creatorId: string) => {
    if (!token) return
    try {
      await unsubscribe(creatorId, token)
      setSubscriptions((prev) => prev.filter((c) => c.id !== creatorId))
    } catch {
      // silently fail
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
      updateUser({
        username: updated.username,
        bio: updated.bio,
        avatar: updated.avatar,
      })
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde")
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

  return { user, form, isEditing, isSaving, error, subscriptions, handleEdit, handleCancel, handleSave, handleChange, handleAvatarChange, handleUnsubscribe }
}
