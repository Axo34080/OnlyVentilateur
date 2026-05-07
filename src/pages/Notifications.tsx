import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { getNotifications } from "../services/notificationsService"
import type { Notification } from "../services/notificationsService"

function TypeIcon({ type }: Readonly<{ type: string }>) {
  if (type === "subscribe") return (
    <svg className="w-5 h-5 text-[#00AFF0]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
    </svg>
  )
  if (type === "like") return (
    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  )
  if (type === "comment") return (
    <svg className="w-5 h-5 text-[#8a8a8a]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
  return (
    <svg className="w-5 h-5 text-[#8a8a8a]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  )
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "À l'instant"
  if (minutes < 60) return `Il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `Il y a ${days}j`
}

function Notifications() {
  const { token } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    getNotifications(token)
      .then(setNotifications)
      .catch(() => setError("Impossible de charger les notifications."))
      .finally(() => setIsLoading(false))
  }, [token])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="text-[#8a8a8a] text-sm animate-pulse">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-white">Notifications</h1>

      {error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : notifications.length === 0 ? (
        <div className="bg-[#111] rounded-2xl border border-[#2a2a2a] p-12 text-center flex flex-col items-center gap-3">
          <svg className="w-10 h-10 text-[#2a2a2a]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <p className="text-[#8a8a8a] text-sm">Aucune notification pour l'instant.</p>
        </div>
      ) : (
        <div className="bg-[#111] rounded-2xl border border-[#2a2a2a] divide-y divide-[#1f1f1f]">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                notif.isRead ? "" : "bg-[#00AFF0]/5"
              }`}
            >
              {notif.actorAvatar ? (
                <img
                  src={notif.actorAvatar}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center shrink-0">
                  <TypeIcon type={notif.type} />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">
                  {notif.message}
                </p>
                <p className="text-xs text-[#555] mt-0.5">{timeAgo(notif.createdAt)}</p>
              </div>

              <div className="shrink-0">
                <TypeIcon type={notif.type} />
              </div>

              {notif.postId && (
                <Link
                  to={`/posts/${notif.postId}`}
                  className="shrink-0 text-xs text-[#00AFF0] hover:underline"
                >
                  Voir →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications
