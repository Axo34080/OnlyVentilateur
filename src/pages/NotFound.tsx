import { Link } from "react-router-dom"

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div className="text-6xl">🌀</div>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">404</h1>
        <p className="text-slate-500 mt-2">Cette page n'existe pas ou a été emportée par un courant d'air.</p>
      </div>
      <div className="flex gap-3">
        <Link
          to="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          Accueil
        </Link>
        <Link
          to="/feed"
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          Fil d'actualité
        </Link>
      </div>
    </div>
  )
}

export default NotFound
