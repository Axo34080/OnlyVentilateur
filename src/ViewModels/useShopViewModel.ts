import { useState, useEffect } from "react"
import { useCart } from "../context/CartContext"
import type { GoodieItem } from "../context/CartContext"
import { getGoodies, goodieToCartItem } from "../services/goodiesService"

interface ShopViewModel {
  goodies: GoodieItem[]
  filter: string
  creators: string[]
  filteredGoodies: GoodieItem[]
  addedId: string | null
  isLoading: boolean
  isCheckingOut: boolean
  checkoutSuccess: boolean
  handleFilter: (creator: string) => void
  handleAddToCart: (goodie: GoodieItem) => void
  handleCheckout: () => void
}

export function useShopViewModel(): ShopViewModel {
  const { addItem, items, totalPrice, clearCart } = useCart()
  const [filter, setFilter] = useState("Tous")
  const [addedId, setAddedId] = useState<string | null>(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)
  const [goodies, setGoodies] = useState<GoodieItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    getGoodies()
      .then((data) => setGoodies(data.map(goodieToCartItem)))
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

  const handleCheckout = () => {
    if (items.length === 0) return
    setIsCheckingOut(true)
    setTimeout(() => {
      clearCart()
      setIsCheckingOut(false)
      setCheckoutSuccess(true)
    }, 1500)
  }

  void totalPrice

  return {
    goodies,
    filter,
    creators,
    filteredGoodies,
    addedId,
    isLoading,
    isCheckingOut,
    checkoutSuccess,
    handleFilter,
    handleAddToCart,
    handleCheckout,
  }
}
