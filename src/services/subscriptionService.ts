export async function subscribe(creatorId: string, token: string): Promise<void> {
  const res = await fetch("/api/subscriptions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ creatorId }),
  })
  if (!res.ok) throw new Error("Erreur lors de l'abonnement")
}

export async function unsubscribe(creatorId: string, token: string): Promise<void> {
  const res = await fetch(`/api/subscriptions/${creatorId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Erreur lors du désabonnement")
}

export async function getUserSubscriptions(token: string): Promise<string[]> {
  const res = await fetch("/api/subscriptions", {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Erreur lors de la récupération des abonnements")
  const data = await res.json()
  return data.map((sub: { creator: { id: string } }) => sub.creator.id)
}
