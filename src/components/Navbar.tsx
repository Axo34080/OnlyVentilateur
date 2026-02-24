import { Link, NavLink } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="font-bold text-slate-900 text-lg">
          🌀 OnlyVentilateur
        </Link>

        {/* Liens + actions */}
        <div className="flex items-center gap-1">
          <NavLink
            to="/creators"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`
            }
          >
            Créateurs
          </NavLink>
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 ml-2">
              <NavLink
                to="/feed"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`
                }
              >
                Fil
              </NavLink>
              <NavLink
                to="/subscriptions"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`
                }
              >
                Abonnements
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
