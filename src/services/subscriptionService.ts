export async function subscribe(creatorId: string, token: string): Promise<void> {
  const res = await fetch("/api/subscriptions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ creatorId }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.message ?? "Erreur lors de l'abonnement")
  }
}

export async function unsubscribe(creatorId: string, token: string): Promise<void> {
  const res = await fetch(`/api/subscriptions/${creatorId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.message ?? "Erreur lors du desabonnement")
  }
}

export async function getUserSubscriptions(token: string): Promise<string[]> {
  const res = await fetch("/api/subscriptions", {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Erreur lors de la recuperation des abonnements")
  const data = await res.json()
  return data.map((sub: { creator: { id: string } }) => sub.creator.id)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCreatorFromSub(c: any) {
  return {
    id: c.id,
    username: c.username,
    displayName: c.displayName,
    avatar: c.avatar ?? "",
    coverImage: c.coverImage ?? "",
    bio: c.bio ?? "",
    subscriptionPrice: Number.parseFloat(c.subscriptionPrice),
    isPremium: c.isPremium,
    subscriberCount: c.subscriberCount ?? 0,
    postCount: c.postCount ?? 0,
  }
}

export async function getSubscribedCreators(token: string) {
  const res = await fetch("/api/subscriptions", {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Erreur lors de la recuperation des abonnements")
  const data = await res.json()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((sub: { creator: any }) => mapCreatorFromSub(sub.creator))
}
