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
    getUnreadCount(token).then(setUnreadCount).catch(() => setUnreadCount(0))
  }, [token])

  useEffect(() => {
    if (location.pathname === '/notifications') setUnreadCount(0)
  }, [location.pathname])

  useEffect(() => {
    if (!token) { setUnreadMessages(0); return }
    getUnreadMessagesCount(token).then(setUnreadMessages).catch(() => setUnreadMessages(0))
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
      isActive ? "bg-[#1a1a1a] text-white" : "text-[#8a8a8a] hover:text-white hover:bg-[#1a1a1a]"
    }`

  return (
    <nav className="bg-[#000] border-b border-[#2a2a2a] sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-white text-lg">
          <img src="/image_2026-03-10_110143029-removebg-preview.png" alt="" className="h-8 w-8 object-contain" />
          <span>Only<span className="text-[#00AFF0]">Ventilateurs</span></span>
        </Link>

        {/* Liens + actions */}
        <div className="flex items-center gap-1">
          <NavLink to="/creators" className={navLink}>Ventilateurs</NavLink>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 ml-2">
              <NavLink to="/feed" className={navLink}>Courants d'air</NavLink>

              {/* Icône messages */}
              <NavLink
                to="/messages"
                className="relative px-2 py-1 rounded-lg hover:bg-[#1a1a1a] transition-colors text-[#8a8a8a] hover:text-white"
                title="Messages"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
              </NavLink>

              {/* Icône notifications */}
              <NavLink
                to="/notifications"
                className="relative px-2 py-1 rounded-lg hover:bg-[#1a1a1a] transition-colors text-[#8a8a8a] hover:text-white"
                title="Notifications"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </NavLink>

              {/* Icône panier */}
              <NavLink
                to="/shop"
                className="relative px-2 py-1 rounded-lg hover:bg-[#1a1a1a] transition-colors text-[#8a8a8a] hover:text-white"
                title="Panier"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#00AFF0] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/profile"
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[#1a1a1a] transition-colors"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#00AFF0]/10 flex items-center justify-center text-xs font-bold text-[#00AFF0]">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-white">{user.username}</span>
              </NavLink>
              <button
                type="button"
                onClick={logout}
                className="text-sm text-[#8a8a8a] hover:text-white px-2 py-1 rounded-lg hover:bg-[#1a1a1a] transition-colors"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-2 bg-[#00AFF0] hover:bg-[#0099CC] text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
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
