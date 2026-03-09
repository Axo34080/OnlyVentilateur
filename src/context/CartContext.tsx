import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"

export interface GoodieItem {
  id: string
  name: string
  price: number
  image: string
  creator: string
}

interface CartItem extends GoodieItem {
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (goodie: GoodieItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = (goodie: GoodieItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === goodie.id)
      if (existing) {
        return prev.map((i) =>
          i.id === goodie.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...goodie, quantity: 1 }]
    })
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    )
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): CartContextType {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart doit être utilisé dans un CartProvider")
  return ctx
}
