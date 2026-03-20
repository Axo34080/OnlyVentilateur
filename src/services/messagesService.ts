import type { Conversation, Message } from '../types/Message'

const BASE = '/api/messages'

export async function getConversations(token: string): Promise<Conversation[]> {
  const res = await fetch(`${BASE}/conversations`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Impossible de charger les conversations')
  return res.json() as Promise<Conversation[]>
}

export async function getHistory(token: string, userId: string): Promise<Message[]> {
  const res = await fetch(`${BASE}/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Impossible de charger les messages')
  return res.json() as Promise<Message[]>
}

export async function getUnreadMessagesCount(token: string): Promise<number> {
  const res = await fetch(`${BASE}/unread-count`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return 0
  const data = await res.json() as number
  return data
}

export async function markConversationAsRead(token: string, userId: string): Promise<void> {
  await fetch(`${BASE}/${userId}/read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function createVideoRoom(token: string): Promise<{ url: string }> {
  const res = await fetch('/api/video/room', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Impossible de créer la room vidéo')
  return res.json() as Promise<{ url: string }>
}
