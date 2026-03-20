import { useEffect, useState } from "react"
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { getCreatorById } from "../services/creatorsService"
import { createSubscriptionCheckout } from "../services/checkoutService"
import { subscribe } from "../services/subscriptionService"
import type { Creator } from "../types/Creator"

function Subscribe() {
  const { creatorId } = useParams<{ creatorId: string }>()
  const { token } = useAuth()
  const [searchParams] = useSearchParams()
  const [creator, setCreator] = useState<Creator | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [isFinalizingPayment, setIsFinalizingPayment] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [subscribeSuccess, setSubscribeSuccess] = useState(false)
  const [cancelled, setCancelled] = useState(false)

  useEffect(() => {
    if (!creatorId) return
    getCreatorById(creatorId)
      .then((data) => setCreator(data))
      .catch(() => setError("Createur introuvable"))
      .finally(() => setIsLoading(false))
  }, [creatorId])

  useEffect(() => {
    const payment = searchParams.get("payment")
    if (payment === "success" && creatorId && token) {
      setIsFinalizingPayment(true)
      setError(null)
      setCancelled(false)
      subscribe(creatorId, token)
        .then(() => setSubscribeSuccess(true))
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Impossible de finaliser l'abonnement demo")
        })
        .finally(() => setIsFinalizingPayment(false))
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
      setError("Erreur lors du paiement. Reessaie.")
      setIsCheckingOut(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md bg-[#111] rounded-2xl border border-[#2a2a2a] overflow-hidden animate-pulse">
          <div className="w-full h-32 bg-[#2a2a2a]" />
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-4 -mt-10">
              <div className="w-16 h-16 rounded-full bg-[#2a2a2a] border-4 border-[#111]" />
              <div className="mt-4 flex flex-col gap-2">
                <div className="h-4 w-32 bg-[#2a2a2a] rounded" />
                <div className="h-3 w-20 bg-[#1a1a1a] rounded" />
              </div>
            </div>
            <div className="h-16 bg-[#1a1a1a] rounded-xl" />
            <div className="h-12 bg-[#2a2a2a] rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error && !creator) return <Navigate to="/creators" replace />
  if (!creator) return <Navigate to="/creators" replace />

  if (isFinalizingPayment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <img src="/image_2026-03-10_110143029-removebg-preview.png" alt="" className="h-16 w-16 object-contain" />
        <h1 className="text-2xl font-bold text-white">Finalisation du souffle en cours...</h1>
        <p className="text-[#8a8a8a]">
          Vérification de l'accès Haute Pression pour <span className="font-semibold text-white">{creator.displayName}</span>.
        </p>
      </div>
    )
  }

  if (subscribeSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <img src="/image_2026-03-10_110143029-removebg-preview.png" alt="" className="h-16 w-16 object-contain" />
        <h1 className="text-2xl font-bold text-white">Tu rejoins les Souffleurs !</h1>
        <p className="text-[#8a8a8a]">
          Abonnement confirmé à <span className="font-semibold text-white">{creator.displayName}</span>.
          Profite de tous les souffles exclusifs.
        </p>
        <Link
          to={`/creators/${creator.id}`}
          className="mt-2 bg-[#00AFF0] hover:bg-[#0099CC] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
        >
          Voir le profil
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md bg-[#111] rounded-2xl border border-[#2a2a2a] overflow-hidden">
        <img
          src={creator.coverImage}
          alt=""
          className="w-full h-32 object-cover"
        />

        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-center gap-4 -mt-10">
            <img
              src={creator.avatar}
              alt={creator.displayName}
              className="w-16 h-16 rounded-full border-4 border-[#111] object-cover shadow-sm"
            />
            <div className="mt-4">
              <h2 className="font-bold text-white">{creator.displayName}</h2>
              <p className="text-sm text-[#8a8a8a]">{creator.username}</p>
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-[#8a8a8a]">
              <span>Souffle mensuel</span>
              <span className="font-semibold text-white">
                {creator.subscriptionPrice.toFixed(2)} EUR
              </span>
            </div>
            <div className="flex justify-between text-[#555] text-xs">
              <span>Renouvellement automatique</span>
              <span>Annulable a tout moment</span>
            </div>
          </div>

          {cancelled && (
            <p className="text-sm text-amber-400 bg-amber-900/20 border border-amber-800/30 rounded-lg px-4 py-2 text-center">
              Paiement annulé. Tu peux reessayer quand tu veux.
            </p>
          )}

          {error && (
            <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/50 rounded-lg px-4 py-2 text-center">
              {error}
            </p>
          )}

          <button
            onClick={handleConfirm}
            disabled={isCheckingOut}
            className="w-full bg-[#00AFF0] hover:bg-[#0099CC] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {isCheckingOut ? "Redirection vers le paiement..." : `Rejoindre les Souffleurs — ${creator.subscriptionPrice.toFixed(2)} EUR/mois`}
          </button>

          <Link
            to={`/creators/${creator.id}`}
            className="text-center text-sm text-[#8a8a8a] hover:text-white transition-colors"
          >
            Annuler
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Subscribe
