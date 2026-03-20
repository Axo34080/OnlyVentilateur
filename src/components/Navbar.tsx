import { useState, useEffect } from "react"
import { Link, NavLink, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import { getUnreadCount } from "../services/notificationsService"
import { getUnreadMessagesCount } from "../services/messagesService"
import { connectSocket } from "../services/socketService"

function Navbar() {
  const { user, token, isAuthenticated, logout } = useAuth()
  const { totalItems } = useCart()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => {
    if (!token) { setUnreadCount(0); return }
    getUnreadCount(token).then(setUnreadCount).catch(() => {})
  }, [token])

  useEffect(() => {
    if (location.pathname === '/notifications') setUnreadCount(0)
  }, [location.pathname])

  useEffect(() => {
    if (!token) { setUnreadMessages(0); return }
    getUnreadMessagesCount(token).then(setUnreadMessages).catch(() => {})
  }, [token])

  useEffect(() => {
    if (location.pathname.startsWith('/messages')) setUnreadMessages(0)
  }, [location.pathname])

  // Increment badge in real-time when a new message arrives
  useEffect(() => {
    if (!token) return
    const socket = connectSocket(token)
    const handleNewMessage = () => {
      if (!location.pathname.startsWith('/messages')) {
        setUnreadMessages((prev) => prev + 1)
      }
    }
    socket.on('new_message', handleNewMessage)
    return () => { socket.off('new_message', handleNewMessage) }
  }, [token, location.pathname])

  const navLink = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      isActive ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
    }`

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-900 text-lg">
          <img src="/image_2026-03-10_110143029-removebg-preview.png" alt="" className="h-8 w-8 object-contain" />
          <span>OnlyVentilateur</span>
        </Link>

        {/* Liens + actions */}
        <div className="flex items-center gap-1">
          <NavLink to="/creators" className={navLink}>Créateurs</NavLink>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 ml-2">
              <NavLink to="/feed" className={navLink}>Fil</NavLink>

              {/* Icône messages */}
              <NavLink
                to="/messages"
                className="relative px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-900"
                title="Messages"
              >
                💬
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
              </NavLink>

              {/* Icône notifications */}
              <NavLink
                to="/notifications"
                className="relative px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-900"
                title="Notifications"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </NavLink>

              {/* Icône panier */}
              <NavLink
                to="/shop"
                className="relative px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-900"
                title="Panier"
              >
                🛒
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/profile"
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-slate-700">{user.username}</span>
              </NavLink>
              <button
                onClick={logout}
                className="text-sm text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
            >
              Connexion
            </Link>
          )}
        </div>

      </div>
    </nav>
  )
}

export default Navbar
