export interface PublicUser {
  id: string
  username: string
  avatar?: string
  bio?: string
  creatorId?: string
}

export async function getPublicUser(id: string): Promise<PublicUser> {
  const res = await fetch(`/api/users/${id}`)
  if (!res.ok) throw new Error("Utilisateur introuvable")
  return res.json() as Promise<PublicUser>
}
