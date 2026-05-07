import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { getHistory, markConversationAsRead } from '../services/messagesService'
import {
  connectSocket,
  sendMessage as socketSendMessage,
  onNewMessage,
} from '../services/socketService'
import { uploadFile } from '../services/uploadService'
import type { Message } from '../types/Message'

export function useChatViewModel(otherUserId: string) {
  const { token, user } = useAuth()
  const { resetUnread } = useChat()
  const location = useLocation()
  const locationState = location.state as { username?: string; avatar?: string | null } | null
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [fileProgress, setFileProgress] = useState<number | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load history
  useEffect(() => {
    if (!token) return
    setIsLoading(true)
    setError(null)
    getHistory(token, otherUserId)
      .then(setMessages)
      .catch(() => setError("Impossible de charger la conversation."))
      .finally(() => setIsLoading(false))
  }, [token, otherUserId])

  // Marque la conversation comme lue et remet le badge à 0 (via ChatContext)
  useEffect(() => {
    if (!token || !otherUserId) return
    markConversationAsRead(token, otherUserId).catch(() => {
      setError("Impossible de marquer la conversation comme lue.")
    })
    resetUnread()
  }, [token, otherUserId, resetUnread])

  // Connect socket
  useEffect(() => {
    if (!token) return
    connectSocket(token)

    const handleIncomingMessage = (msg: Message) => {
      if (
        (msg.senderId === otherUserId && msg.receiverId === user?.id) ||
        (msg.senderId === user?.id && msg.receiverId === otherUserId)
      ) {
        setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg])
      }
    }
    const unsubMsg = onNewMessage(handleIncomingMessage)

    return () => {
      unsubMsg()
    }
  }, [token, otherUserId, user?.id])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendText = useCallback(() => {
    if (!text.trim()) return
    socketSendMessage(otherUserId, text.trim())
    setText('')
  }, [text, otherUserId])

  const sendFile = useCallback(
    async (file: File) => {
      if (!token) return
      setFileProgress(10)
      setFileError(null)
      try {
        const url = await uploadFile(file, token)
        setFileProgress(100)
        socketSendMessage(otherUserId, url, 'file', file.name)
      } catch {
        setFileError("Impossible d'envoyer le fichier.")
      } finally {
        setFileProgress(null)
      }
    },
    [otherUserId, token],
  )

  return {
    messages,
    isLoading,
    error,
    text,
    setText,
    sendText,
    sendFile,
    fileProgress,
    fileError,
    bottomRef,
    currentUserId: user?.id ?? '',
    otherUsername: locationState?.username ?? null,
    otherAvatar: locationState?.avatar ?? null,
  }
}
