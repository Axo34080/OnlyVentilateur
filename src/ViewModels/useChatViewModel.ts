import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
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
  const location = useLocation()
  const locationState = location.state as { username?: string; avatar?: string | null } | null
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [text, setText] = useState('')
  const [fileProgress, setFileProgress] = useState<number | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load history
  useEffect(() => {
    if (!token) return
    setIsLoading(true)
    getHistory(token, otherUserId)
      .then(setMessages)
      .catch(() => null)
      .finally(() => setIsLoading(false))
  }, [token, otherUserId])

  // Mark conversation as read when chat is opened
  useEffect(() => {
    if (!token || !otherUserId) return
    markConversationAsRead(token, otherUserId).catch(() => null)
  }, [token, otherUserId])

  // Connect socket
  useEffect(() => {
    if (!token) return
    connectSocket(token)

    const unsubMsg = onNewMessage((msg) => {
      if (
        (msg.senderId === otherUserId && msg.receiverId === user?.id) ||
        (msg.senderId === user?.id && msg.receiverId === otherUserId)
      ) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === msg.id)
          return exists ? prev : [...prev, msg]
        })
      }
    })

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
      try {
        const url = await uploadFile(file, token)
        setFileProgress(100)
        socketSendMessage(otherUserId, url, 'file', file.name)
      } finally {
        setFileProgress(null)
      }
    },
    [otherUserId, token],
  )

  return {
    messages,
    isLoading,
    text,
    setText,
    sendText,
    sendFile,
    fileProgress,
    bottomRef,
    currentUserId: user?.id ?? '',
    otherUsername: locationState?.username ?? null,
    otherAvatar: locationState?.avatar ?? null,
  }
}
