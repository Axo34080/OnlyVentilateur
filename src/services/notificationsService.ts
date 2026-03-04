export interface Notification {
  id: string
  userId: string
  type: 'subscribe' | 'like' | 'comment'
  message: string
  isRead: boolean
  postId: string | null
  actorAvatar: string | null
  createdAt: string
}

export async function getNotifications(token: string): Promise<Notification[]> {
  const res = await fetch('/api/notifications', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Erreur lors du chargement des notifications')
  return res.json()
}

export async function getUnreadCount(token: string): Promise<number> {
  const res = await fetch('/api/notifications/unread-count', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return 0
  const data = await res.json() as { count: number }
  return data.count
}
