import { useState } from "react"
import { useParams, Navigate, Link } from "react-router-dom"
import { MOCK_CREATORS } from "../data/mockCreators"

function Subscribe() {
  const { creatorId } = useParams<{ creatorId: string }>()
  const [confirmed, setConfirmed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const creator = MOCK_CREATORS.find((c) => c.id === creatorId)
  if (!creator) return <Navigate to="/creators" replace />

  const handleConfirm = async () => {
    setIsLoading(true)
    // Simule le paiement (Phase 5 : Stripe Checkout)
    await new Promise((res) => setTimeout(res, 800))
    setIsLoading(false)
    setConfirmed(true)
  }

  if (confirmed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="text-5xl">🌀</div>
        <h1 className="text-2xl font-bold text-slate-900">Abonnement confirmé !</h1>
        <p className="text-slate-500">
          Tu es maintenant abonné à <span className="font-semibold">{creator.displayName}</span>.
          Profite du contenu exclusif.
        </p>
        <Link
          to={`/creators/${creator.id}`}
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
        >
          Voir le profil
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Cover créateur */}
        <img
          src={creator.coverImage}
          alt=""
          className="w-full h-32 object-cover"
        />

        {/* Récap */}
        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-center gap-4 -mt-10">
            <img
              src={creator.avatar}
              alt={creator.displayName}
              className="w-16 h-16 rounded-full border-4 border-white object-cover shadow-sm"
            />
            <div className="mt-4">
              <h2 className="font-bold text-slate-900">{creator.displayName}</h2>
              <p className="text-sm text-slate-400">{creator.username}</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Abonnement mensuel</span>
              <span className="font-semibold text-slate-900">
                {creator.subscriptionPrice.toFixed(2)} €
              </span>
            </div>
            <div className="flex justify-between text-slate-400 text-xs">
              <span>Renouvellement automatique</span>
              <span>Annulable à tout moment</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center">
            Paiement simulé — aucune carte bancaire requise.{" "}
            <span className="text-slate-500">(Phase 5 : intégration Stripe)</span>
          </p>

          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {isLoading ? "Traitement..." : `Confirmer — ${creator.subscriptionPrice.toFixed(2)} €/mois`}
          </button>

          <Link
            to={`/creators/${creator.id}`}
            className="text-center text-sm text-slate-400 hover:text-slate-600"
          >
            Annuler
          </Link>
        </div>

      </div>
    </div>
  )
}

export default Subscribe
