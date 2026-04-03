import { useState, useEffect } from "react"
import { Link, NavLink, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import { useChat } from "../context/ChatContext"
import { getUnreadCount } from "../services/notificationsService"

const OF_TEAL = "#00AFF0"

function Sidebar() {
  const { user, token, isAuthenticated, logout } = useAuth()
  const { totalItems } = useCart()
  // unreadMessages vit dans ChatContext — partagé avec la vue Chat
  const { unreadMessages, resetUnread } = useChat()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!token) { setUnreadCount(0); return }
    getUnreadCount(token).then(setUnreadCount).catch(() => {})
  }, [token])

  useEffect(() => {
    if (location.pathname === '/notifications') setUnreadCount(0)
  }, [location.pathname])

  useEffect(() => {
    if (location.pathname.startsWith('/messages')) resetUnread()
  }, [location.pathname, resetUnread])

  // Fermer la sidebar mobile lors d'un changement de route
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const navLink = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? "bg-white/10 text-[#00AFF0]"
        : "text-gray-300 hover:bg-white/10 hover:text-white"
    }`

  const sidebarContent = (
    <aside className="h-full flex flex-col bg-[#050508] text-white border-r border-[#1a1a1a]">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          onClick={() => setMobileOpen(false)}
        >
          <img
            src="/image_2026-03-10_110143029-removebg-preview.png"
            alt=""
            className="h-9 w-9 object-contain"
          />
          <span className="font-bold text-xl tracking-tight">
            Only<span style={{ color: OF_TEAL }}>Ventilateurs</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">

        <NavLink to="/" end className={navLink}>
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Accueil
        </NavLink>

        {isAuthenticated && (
          <NavLink to="/feed" className={navLink}>
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            Courants d'air
          </NavLink>
        )}

        <NavLink to="/creators" className={navLink}>
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Ventilateurs
        </NavLink>

        {isAuthenticated && (
          <NavLink to="/messages" className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              isActive ? "bg-white/10 text-[#00AFF0]" : "text-gray-300 hover:bg-white/10 hover:text-white"
            }`
          }>
            <span className="relative">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {unreadMessages > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </span>
            Messages
            {unreadMessages > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </span>
            )}
          </NavLink>
        )}

        {isAuthenticated && (
          <NavLink to="/notifications" className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              isActive ? "bg-white/10 text-[#00AFF0]" : "text-gray-300 hover:bg-white/10 hover:text-white"
            }`
          }>
            <span className="relative">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </span>
            Notifications
            {unreadCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </NavLink>
        )}

        <NavLink to="/shop" className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
            isActive ? "bg-white/10 text-[#00AFF0]" : "text-gray-300 hover:bg-white/10 hover:text-white"
          }`
        }>
          <span className="relative">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#00AFF0] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </span>
          Shop
          {totalItems > 0 && (
            <span className="ml-auto bg-[#00AFF0] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {totalItems}
            </span>
          )}
        </NavLink>

        {isAuthenticated && user?.creatorId && (
          <NavLink to="/dashboard" className={navLink}>
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Tableau de bord
          </NavLink>
        )}
      </nav>

      {/* Section utilisateur */}
      <div className="p-4 border-t border-white/10">
        {isAuthenticated && user ? (
          <div className="space-y-2">
            <NavLink
              to={user.creatorId ? `/creators/${user.creatorId}` : "/profile/edit"}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white/20"
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ring-2 ring-white/20"
                  style={{ backgroundColor: OF_TEAL, color: "#fff" }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </NavLink>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Déconnexion
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm text-white transition-colors"
            style={{ backgroundColor: OF_TEAL }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Connexion
          </Link>
        )}
      </div>
    </aside>
  )

  return (
    <>
      {/* Sidebar desktop */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen w-[240px] z-20">
        {sidebarContent}
      </div>

      {/* Barre mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#050508] z-20 flex items-center justify-between px-4 border-b border-[#1a1a1a]">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/image_2026-03-10_110143029-removebg-preview.png"
            alt=""
            className="h-7 w-7 object-contain"
          />
          <span className="font-bold text-white text-base">
            Only<span style={{ color: OF_TEAL }}>Ventilateurs</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="p-2 text-gray-300 hover:text-white transition-colors"
          aria-label="Menu"
        >
          {mobileOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 flex">
          <div className="w-[240px] h-full">{sidebarContent}</div>
          <div
            className="flex-1 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}
    </>
  )
}

export default Sidebar
