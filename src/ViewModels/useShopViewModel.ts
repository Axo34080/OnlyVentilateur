import { useState } from "react"
import { mockGoodies } from "../data/mockGoodies"
import { useCart } from "../context/CartContext"
import type { GoodieItem } from "../context/CartContext"

interface ShopViewModel {
  goodies: GoodieItem[]
  filter: string
  creators: string[]
  filteredGoodies: GoodieItem[]
  addedId: string | null
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

  const creators = ["Tous", ...Array.from(new Set(mockGoodies.map((g) => g.creator)))]

  const filteredGoodies =
    filter === "Tous" ? mockGoodies : mockGoodies.filter((g) => g.creator === filter)

  const handleFilter = (creator: string) => setFilter(creator)

  const handleAddToCart = (goodie: GoodieItem) => {
    addItem(goodie)
    setAddedId(goodie.id)
    setTimeout(() => setAddedId(null), 1500)
  }

  const handleCheckout = () => {
    if (items.length === 0) return
    setIsCheckingOut(true)
    // Simulation d'un checkout (délai 1.5s)
    setTimeout(() => {
      clearCart()
      setIsCheckingOut(false)
      setCheckoutSuccess(true)
    }, 1500)
  }

  // Expose totalPrice via le cart pour les composants
  void totalPrice

  return {
    goodies: mockGoodies,
    filter,
    creators,
    filteredGoodies,
    addedId,
    isCheckingOut,
    checkoutSuccess,
    handleFilter,
    handleAddToCart,
    handleCheckout,
  }
}
