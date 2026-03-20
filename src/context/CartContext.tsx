import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"

export interface GoodieItem {
  id: string
  name: string
  price: number
  image: string
  creator: string
  variants?: string[]
  variant?: string
}

export interface CartItem extends GoodieItem {
  quantity: number
  cartKey: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (goodie: GoodieItem) => void
  removeItem: (cartKey: string) => void
  updateQuantity: (cartKey: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | null>(null)

const CART_KEY = "onlyventilateur_cart"

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

function makeCartKey(id: string, variant?: string): string {
  return variant ? `${id}|${variant}` : id
}

export function CartProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [items, setItems] = useState<CartItem[]>(loadCart)

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((goodie: GoodieItem) => {
    const key = makeCartKey(goodie.id, goodie.variant)
    setItems((prev) => {
      const existing = prev.find((i) => i.cartKey === key)
      if (existing) {
        return prev.map((i) =>
          i.cartKey === key ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...goodie, quantity: 1, cartKey: key }]
    })
  }, [])

  const removeItem = useCallback((cartKey: string) => {
    setItems((prev) => prev.filter((i) => i.cartKey !== cartKey))
  }, [])

  const updateQuantity = useCallback((cartKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartKey)
      return
    }
    setItems((prev) =>
      prev.map((i) => (i.cartKey === cartKey ? { ...i, quantity } : i))
    )
  }, [removeItem])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const contextValue = useMemo(
    () => ({ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }),
    [items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice]
  )

  return (
    <CartContext.Provider value={contextValue}>
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
