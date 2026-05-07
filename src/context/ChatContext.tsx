/**
 * PRÉSENTATION — Pourquoi useContext ici ?
 *
 * La Sidebar (badge de messages) et la vue Chat sont deux composants
 * sans relation parent-enfant dans l'arbre React. Sans contexte, il est
 * impossible de partager `unreadMessages` entre eux.
 *
 * Avant : état local dans Sidebar → Chat ne pouvait pas remettre le badge à 0.
 * Après  : ChatContext centralise le compteur — n'importe quel composant
 *          peut lire `unreadMessages` ou appeler `resetUnread()` via useChat().
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getUnreadMessagesCount } from '../services/messagesService'
import { connectSocket } from '../services/socketService'

interface ChatContextType {
  unreadMessages: number
  resetUnread: () => void
}

const ChatContext = createContext<ChatContextType | null>(null)

export function ChatProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { token } = useAuth()
  const [unreadMessages, setUnreadMessages] = useState(0)

  // Initialise le compteur depuis l'API au login
  useEffect(() => {
    if (!token) { setUnreadMessages(0); return }
    getUnreadMessagesCount(token).then(setUnreadMessages).catch(() => setUnreadMessages(0))
  }, [token])

  // Écoute les nouveaux messages via le socket (une seule fois, ici)
  // On incrémente uniquement quand l'utilisateur n'est pas déjà sur /messages
  useEffect(() => {
    if (!token) return
    const socket = connectSocket(token)

    const handleNewMessage = () => {
      const currentPath = globalThis.location?.pathname ?? ''
      if (!currentPath.startsWith('/messages')) {
        setUnreadMessages((prev) => prev + 1)
      }
    }

    socket.on('new_message', handleNewMessage)
    // Cleanup : on retire le listener quand le token change ou au démontage
    return () => { socket.off('new_message', handleNewMessage) }
  }, [token])

  const resetUnread = useCallback(() => setUnreadMessages(0), [])

  // useMemo : évite de recréer l'objet de valeur à chaque render
  const value = useMemo(
    () => ({ unreadMessages, resetUnread }),
    [unreadMessages, resetUnread],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useChat(): ChatContextType {
  // Lance une erreur explicite si le hook est utilisé hors du Provider
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat doit être utilisé dans un ChatProvider')
  return ctx
}
