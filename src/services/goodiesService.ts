import type { GoodieItem } from "../context/CartContext"

export interface Goodie {
  id: string
  name: string
  description?: string
  price: number
  image: string
  inStock: boolean
  creatorId: string
  creator?: { displayName: string; username: string }
}

export async function getGoodies(creatorId?: string): Promise<Goodie[]> {
  const url = creatorId ? `/api/goodies?creatorId=${creatorId}` : "/api/goodies"
  const res = await fetch(url)
  if (!res.ok) throw new Error("Erreur lors du chargement des goodies")
  return res.json() as Promise<Goodie[]>
}

export async function createGoodie(data: Omit<Goodie, "id" | "creator" | "creatorId">, token: string): Promise<Goodie> {
  const res = await fetch("/api/goodies", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Erreur lors de la création du goodie")
  return res.json() as Promise<Goodie>
}

export async function updateGoodie(id: string, data: Partial<Omit<Goodie, "id" | "creator" | "creatorId">>, token: string): Promise<Goodie> {
  const res = await fetch(`/api/goodies/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Erreur lors de la mise à jour du goodie")
  return res.json() as Promise<Goodie>
}

export async function deleteGoodie(id: string, token: string): Promise<void> {
  const res = await fetch(`/api/goodies/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Erreur lors de la suppression du goodie")
}

export function goodieToCartItem(g: Goodie): GoodieItem {
  return {
    id: g.id,
    name: g.name,
    price: Number(g.price),
    image: g.image,
    creator: g.creator?.displayName ?? "",
  }
}
