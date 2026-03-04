import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { getNotifications } from "../services/notificationsService"
import type { Notification } from "../services/notificationsService"

const typeIcon: Record<string, string> = {
  subscribe: "👤",
  like: "❤️",
  comment: "💬",
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

  useEffect(() => {
    if (!token) return
    getNotifications(token)
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [token])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="text-slate-400 text-sm animate-pulse">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="text-4xl mb-3">🔔</div>
          <p className="text-slate-400 text-sm">Aucune notification pour l'instant.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                !notif.isRead ? "bg-blue-50/50" : ""
              }`}
            >
              {notif.actorAvatar ? (
                <img
                  src={notif.actorAvatar}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg shrink-0">
                  {typeIcon[notif.type] ?? "🔔"}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800">
                  {notif.message}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{timeAgo(notif.createdAt)}</p>
              </div>

              <div className="shrink-0 text-lg">{typeIcon[notif.type] ?? "🔔"}</div>

              {notif.postId && (
                <Link
                  to={`/posts/${notif.postId}`}
                  className="shrink-0 text-xs text-blue-600 hover:underline"
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
