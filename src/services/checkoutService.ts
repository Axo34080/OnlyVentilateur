import type { GoodieItem } from "../context/CartContext"

interface CartItemWithQty extends GoodieItem {
  quantity: number
}

export async function createSubscriptionCheckout(creatorId: string, token: string): Promise<string> {
  const res = await fetch("/api/checkout/subscription", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ creatorId }),
  })
  if (!res.ok) throw new Error("Impossible de créer la session de paiement")
  const data = await res.json() as { url: string }
  return data.url
}

export async function createOrderCheckout(items: CartItemWithQty[], token: string): Promise<string> {
  const res = await fetch("/api/checkout/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      items: items.map((i) => ({
        name: i.variant ? `${i.name} (${i.variant})` : i.name,
        price: i.price,
        quantity: i.quantity,
      })),
    }),
  })
  if (!res.ok) throw new Error("Impossible de créer la session de paiement")
  const data = await res.json() as { url: string }
  return data.url
}
