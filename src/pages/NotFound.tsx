import { Link } from "react-router-dom"

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <img src="/image_2026-03-10_110143029-removebg-preview.png" alt="" className="h-20 w-20 object-contain opacity-50" />
      <div>
        <h1 className="text-4xl font-bold text-white">404</h1>
        <p className="text-[#8a8a8a] mt-2">Cette page n'existe pas ou a été emportée par un courant d'air.</p>
      </div>
      <div className="flex gap-3">
        <Link
          to="/"
          className="bg-[#00AFF0] hover:bg-[#0099CC] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          Accueil
        </Link>
        <Link
          to="/feed"
          className="bg-[#2a2a2a] hover:bg-[#333] text-[#8a8a8a] hover:text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          Courants d'air
        </Link>
      </div>
    </div>
  )
}

export default NotFound
