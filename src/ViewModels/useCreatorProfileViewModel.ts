import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import { getCreatorById, getLikedPostIds } from "../services/creatorsService"
import { unsubscribe, getUserSubscriptions, getSubscribedCreators } from "../services/subscriptionService"
import { uploadFile } from "../services/uploadService"
import type { Creator } from "../types/Creator"
import type { Post } from "../types/Post"

interface ProfileForm {
  displayName: string
  bio: string
  avatar: string
  coverImage: string
  subscriptionPrice: string
}

interface CreatorProfileViewModel {
  creator: Creator | null
  posts: Post[]
  isSubscribed: boolean
  isCheckingSubscription: boolean
  isLoading: boolean
  isOwnProfile: boolean
  error: string | null
  // Édition du profil (page créateur own)
  isEditingProfile: boolean
  isSavingProfile: boolean
  profileForm: ProfileForm
  profileError: string | null
  subscriptions: Creator[]
  handleEditProfile: () => void
  handleCancelEditProfile: () => void
  handleSaveProfile: () => Promise<void>
  handleProfileChange: (field: keyof ProfileForm, value: string) => void
  isUploadingAvatar: boolean
  isUploadingCover: boolean
  handleAvatarFileChange: (file: File) => Promise<void>
  handleCoverFileChange: (file: File) => Promise<void>
  handleUnsubscribeFromCreator: (targetId: string) => Promise<void>
  // Abonnement
  handleSubscribe: () => Promise<void>
  // Likes
  handleLike: (postId: string) => void
  isPostLiked: (postId: string) => boolean
}

export function useCreatorProfileViewModel(creatorId: string): CreatorProfileViewModel {
  const { token, user, updateUser } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [creator, setCreator] = useState<Creator | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(!!token)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set())

  // Édition du profil
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    displayName: "",
    bio: "",
    avatar: "",
    coverImage: "",
    subscriptionPrice: "",
  })
  const [subscriptions, setSubscriptions] = useState<Creator[]>([])

  const isOwnProfile = !!user?.creatorId && user.creatorId === creatorId

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
    if (!token) {
      setIsCheckingSubscription(false)
      return
    }
    setIsCheckingSubscription(true)
    getUserSubscriptions(token)
      .then((ids) => setIsSubscribed(ids.includes(creatorId)))
      .catch(() => {})
      .finally(() => setIsCheckingSubscription(false))
  }, [token, creatorId])

  useEffect(() => {
    if (!token) return
    getLikedPostIds(token)
      .then((ids) => setLikedPostIds(new Set(ids)))
      .catch(() => {})
  }, [token])

  // Charger les abonnements uniquement sur notre propre page
  useEffect(() => {
    if (!token || !user?.creatorId || user.creatorId !== creatorId) return
    getSubscribedCreators(token).then(setSubscriptions).catch(() => {})
  }, [token, user?.creatorId, creatorId])

  const handleSubscribe = async () => {
    if (!token) {
      navigate("/login")
      return
    }
    try {
      if (isSubscribed) {
        await unsubscribe(creatorId, token)
        setIsSubscribed(false)
        setCreator((prev) =>
          prev ? { ...prev, subscriberCount: Math.max(0, (prev.subscriberCount ?? 1) - 1) } : prev
        )
        showToast("Désabonné", "info")
      } else {
        navigate(`/subscribe/${creatorId}`)
        return
      }
    } catch {
      showToast("Erreur lors de l'abonnement", "error")
    }
  }

  const handleLike = (postId: string) => {
    if (!token) return

    const wasLiked = likedPostIds.has(postId)

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, likes: wasLiked ? Math.max(0, p.likes - 1) : p.likes + 1 } : p
      )
    )
    setLikedPostIds((prev) => {
      const next = new Set(prev)
      if (wasLiked) next.delete(postId)
      else next.add(postId)
      return next
    })

    fetch(`/api/posts/${postId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((result: { likes: number; isLiked: boolean }) => {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, likes: result.likes } : p))
        )
        setLikedPostIds((prev) => {
          const next = new Set(prev)
          if (result.isLiked) next.add(postId)
          else next.delete(postId)
          return next
        })
      })
      .catch(() => {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, likes: wasLiked ? p.likes + 1 : Math.max(0, p.likes - 1) } : p
          )
        )
        setLikedPostIds((prev) => {
          const next = new Set(prev)
          if (wasLiked) next.add(postId)
          else next.delete(postId)
          return next
        })
      })
  }

  const isPostLiked = (postId: string) => likedPostIds.has(postId)

  const handleEditProfile = () => {
    setProfileForm({
      displayName: creator?.displayName ?? "",
      bio: creator?.bio ?? "",
      avatar: creator?.avatar ?? "",
      coverImage: creator?.coverImage ?? "",
      subscriptionPrice: String(creator?.subscriptionPrice ?? ""),
    })
    setIsEditingProfile(true)
    setProfileError(null)
  }

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false)
    setProfileError(null)
  }

  const handleProfileChange = (field: keyof ProfileForm, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleAvatarFileChange = async (file: File) => {
    if (!token) return
    setIsUploadingAvatar(true)
    try {
      const url = await uploadFile(file, token)
      setProfileForm((prev) => ({ ...prev, avatar: url }))
    } catch {
      // silently fail — l'ancien avatar reste affiché
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleCoverFileChange = async (file: File) => {
    if (!token) return
    setIsUploadingCover(true)
    try {
      const url = await uploadFile(file, token)
      setProfileForm((prev) => ({ ...prev, coverImage: url }))
    } catch {
      // silently fail
    } finally {
      setIsUploadingCover(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!token) return
    setIsSavingProfile(true)
    setProfileError(null)
    try {
      // Sauvegarder bio + avatar (profil utilisateur → synce aussi sur le créateur côté back)
      const userRes = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          bio: profileForm.bio || undefined,
          avatar: profileForm.avatar || undefined,
        }),
      })
      if (!userRes.ok) throw new Error("Erreur lors de la sauvegarde du profil")
      const updatedUser = await userRes.json()
      updateUser({ bio: updatedUser.bio, avatar: updatedUser.avatar })

      // Sauvegarder displayName + coverImage + prix (profil créateur)
      const creatorRes = await fetch("/api/creators/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          displayName: profileForm.displayName || undefined,
          coverImage: profileForm.coverImage || undefined,
          subscriptionPrice: profileForm.subscriptionPrice
            ? parseFloat(profileForm.subscriptionPrice)
            : undefined,
        }),
      })
      if (!creatorRes.ok) throw new Error("Erreur lors de la sauvegarde du profil créateur")
      const updatedCreator = await creatorRes.json()

      setCreator((prev) =>
        prev
          ? {
              ...prev,
              displayName: updatedCreator.displayName ?? prev.displayName,
              bio: updatedUser.bio ?? prev.bio,
              avatar: updatedUser.avatar ?? prev.avatar,
              coverImage: updatedCreator.coverImage ?? prev.coverImage,
              subscriptionPrice: updatedCreator.subscriptionPrice ?? prev.subscriptionPrice,
            }
          : prev
      )
      setIsEditingProfile(false)
      showToast("Profil mis à jour", "success")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la sauvegarde"
      setProfileError(msg)
      showToast(msg, "error")
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleUnsubscribeFromCreator = async (targetId: string) => {
    if (!token) return
    try {
      await unsubscribe(targetId, token)
      setSubscriptions((prev) => prev.filter((c) => c.id !== targetId))
      showToast("Désabonné", "info")
    } catch {
      showToast("Erreur lors du désabonnement", "error")
    }
  }

  return {
    creator, posts, isSubscribed, isCheckingSubscription, isLoading, error, isOwnProfile,
    isEditingProfile, isSavingProfile, profileForm, profileError, subscriptions,
    isUploadingAvatar, isUploadingCover,
    handleEditProfile, handleCancelEditProfile, handleSaveProfile, handleProfileChange,
    handleAvatarFileChange, handleCoverFileChange, handleUnsubscribeFromCreator,
    handleSubscribe, handleLike, isPostLiked,
  }
}
