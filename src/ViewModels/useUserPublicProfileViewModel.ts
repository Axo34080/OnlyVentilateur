import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { getPublicUser } from "../services/usersService"
import type { PublicUser } from "../services/usersService"

interface UserPublicProfileViewModel {
  publicUser: PublicUser | null
  isLoading: boolean
  isOwnProfile: boolean
  isCreator: boolean
}

export function useUserPublicProfileViewModel(userId: string): UserPublicProfileViewModel {
  const { user } = useAuth()
  const [publicUser, setPublicUser] = useState<PublicUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    getPublicUser(userId)
      .then((data) => { if (!cancelled) setPublicUser(data) })
      .catch(() => { if (!cancelled) setPublicUser(null) })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [userId])

  const isOwnProfile = !!user && user.id === userId
  const isCreator = !!publicUser?.creatorId

  return { publicUser, isLoading, isOwnProfile, isCreator }
}
