import { useState, useEffect } from "react"
import { useParams, Navigate, Link, useSearchParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { getCreatorById } from "../services/creatorsService"
import { subscribe } from "../services/subscriptionService"
import { createSubscriptionCheckout } from "../services/checkoutService"
import type { Creator } from "../types/Creator"

function Subscribe() {
  const { creatorId } = useParams<{ creatorId: string }>()
  const { token } = useAuth()
  const [searchParams] = useSearchParams()
  const [creator, setCreator] = useState<Creator | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [subscribeSuccess, setSubscribeSuccess] = useState(false)
  const [cancelled, setCancelled] = useState(false)

  useEffect(() => {
    if (!creatorId) return
    getCreatorById(creatorId)
      .then((data) => setCreator(data))
      .catch(() => setError("Créateur introuvable"))
      .finally(() => setIsLoading(false))
  }, [creatorId])

  // Détection retour Stripe
  useEffect(() => {
    const payment = searchParams.get("payment")
    if (payment === "success" && creatorId && token) {
      subscribe(creatorId, token)
        .then(() => setSubscribeSuccess(true))
        .catch(() => setSubscribeSuccess(true)) // Stripe a déjà encaissé, on confirme quand même
    } else if (payment === "cancel") {
      setCancelled(true)
    }
  }, [searchParams, creatorId, token])

  const handleConfirm = async () => {
    if (!creatorId || !token) {
      setError("Connecte-toi pour t'abonner.")
      return
    }
    setIsCheckingOut(true)
    setError(null)
    try {
      const url = await createSubscriptionCheckout(creatorId, token)
      globalThis.location.href = url
    } catch {
      setError("Erreur lors du paiement. Réessaie.")
      setIsCheckingOut(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
          <div className="w-full h-32 bg-slate-200" />
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-4 -mt-10">
              <div className="w-16 h-16 rounded-full bg-slate-200 border-4 border-white" />
              <div className="mt-4 flex flex-col gap-2">
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-3 w-20 bg-slate-100 rounded" />
              </div>
            </div>
            <div className="h-16 bg-slate-100 rounded-xl" />
            <div className="h-12 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error && !creator) return <Navigate to="/creators" replace />

  if (!creator) return <Navigate to="/creators" replace />

  if (subscribeSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <img src="/image_2026-03-10_110143029-removebg-preview.png" alt="" className="h-16 w-16 object-contain" />
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

          {cancelled && (
            <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-4 py-2 text-center">
              Paiement annulé. Tu peux réessayer quand tu veux.
            </p>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2 text-center">
              {error}
            </p>
          )}

          <button
            onClick={handleConfirm}
            disabled={isCheckingOut}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {isCheckingOut ? "Redirection vers le paiement..." : `Confirmer — ${creator.subscriptionPrice.toFixed(2)} €/mois`}
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
