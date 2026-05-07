import type { GoodieItem } from "../context/CartContext"

interface CartItemWithQty extends GoodieItem {
  quantity: number
}

const STRIPE_CHECKOUT_ORIGIN = "https://checkout.stripe.com"

function parseStripeCheckoutUrl(url: string): URL {
  const parsed = new URL(url)
  if (parsed.origin !== STRIPE_CHECKOUT_ORIGIN) throw new Error("URL de paiement invalide")
  return parsed
}

export function redirectToStripeCheckout(url: string): void {
  const parsed = parseStripeCheckoutUrl(url)
  const browserLocation = globalThis.location
  if (!browserLocation) throw new Error("Redirection indisponible")
  browserLocation.assign(`${STRIPE_CHECKOUT_ORIGIN}${parsed.pathname}${parsed.search}`)
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
  parseStripeCheckoutUrl(data.url)
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
  parseStripeCheckoutUrl(data.url)
  return data.url
}
