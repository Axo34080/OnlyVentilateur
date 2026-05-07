import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import type { GoodieItem } from "../context/CartContext"
import { getGoodies, goodieToCartItem } from "../services/goodiesService"
import { createOrderCheckout } from "../services/checkoutService"

interface ShopViewModel {
  goodies: GoodieItem[]
  filter: string
  creators: string[]
  filteredGoodies: GoodieItem[]
  addedId: string | null
  isLoading: boolean
  isCheckingOut: boolean
  checkoutSuccess: boolean
  checkoutError: string | null
  handleFilter: (creator: string) => void
  handleAddToCart: (goodie: GoodieItem) => void
  handleCheckout: () => Promise<void>
}

export function useShopViewModel(): ShopViewModel {
  const { token } = useAuth()
  const { addItem, items, clearCart } = useCart()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [filter, setFilter] = useState("Tous")
  const [addedId, setAddedId] = useState<string | null>(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [goodies, setGoodies] = useState<GoodieItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Détection retour Stripe
  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      clearCart()
      setCheckoutSuccess(true)
    }
  }, [searchParams, clearCart])

  useEffect(() => {
    setIsLoading(true)
    getGoodies()
      .then((data) => setGoodies(data.map((g) => goodieToCartItem(g))))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const creators = ["Tous", ...Array.from(new Set(goodies.map((g) => g.creator).filter(Boolean)))]

  const filteredGoodies =
    filter === "Tous" ? goodies : goodies.filter((g) => g.creator === filter)

  const handleFilter = (creator: string) => setFilter(creator)

  const handleAddToCart = (goodie: GoodieItem) => {
    addItem(goodie)
    setAddedId(goodie.id)
    setTimeout(() => setAddedId(null), 1500)
  }

  const handleCheckout = async () => {
    if (items.length === 0) return
    if (!token) { navigate("/login"); return }
    setIsCheckingOut(true)
    setCheckoutError(null)
    try {
      const url = await createOrderCheckout(items, token)
      if (new URL(url).origin !== "https://checkout.stripe.com") throw new Error("URL de paiement invalide")
      globalThis.location.href = url
    } catch {
      setCheckoutError("Erreur lors du paiement. Réessaie.")
      setIsCheckingOut(false)
    }
  }

  return {
    goodies,
    filter,
    creators,
    filteredGoodies,
    addedId,
    isLoading,
    isCheckingOut,
    checkoutSuccess,
    checkoutError,
    handleFilter,
    handleAddToCart,
    handleCheckout,
  }
}
