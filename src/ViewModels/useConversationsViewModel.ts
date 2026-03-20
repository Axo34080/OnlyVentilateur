import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getConversations } from '../services/messagesService'
import type { Conversation } from '../types/Message'

export function useConversationsViewModel() {
  const { token } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    setIsLoading(true)
    getConversations(token)
      .then(setConversations)
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [token])

  return { conversations, isLoading, error }
}
