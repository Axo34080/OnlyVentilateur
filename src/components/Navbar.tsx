import { useState, useEffect } from "react"
import { Link, NavLink, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import { getUnreadCount } from "../services/notificationsService"

function Navbar() {
  const { user, token, isAuthenticated, logout } = useAuth()
  const { totalItems } = useCart()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!token) { setUnreadCount(0); return }
    getUnreadCount(token).then(setUnreadCount).catch(() => {})
  }, [token])

  useEffect(() => {
    if (location.pathname === '/notifications') setUnreadCount(0)
  }, [location.pathname])

  const navLink = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      isActive ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
    }`

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="font-bold text-slate-900 text-lg">
          🌀 OnlyVentilateur
        </Link>

        {/* Liens + actions */}
        <div className="flex items-center gap-1">
          <NavLink to="/creators" className={navLink}>Créateurs</NavLink>
          <NavLink to="/shop" className={navLink}>Boutique</NavLink>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 ml-2">
              <NavLink to="/feed" className={navLink}>Fil</NavLink>
              <NavLink to="/subscriptions" className={navLink}>Abonnements</NavLink>

              <NavLink to="/dashboard" className={navLink}>Dashboard</NavLink>

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
