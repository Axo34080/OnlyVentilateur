import type { Post } from "../types/Post"

export interface CreatePostDto {
  title: string
  description: string
  image: string
  isLocked: boolean
  price?: number
  tags: string[]
}

export interface UpdatePostDto extends Partial<CreatePostDto> {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPost(p: any): Post {
  return {
    id: p.id,
    creatorId: p.creator?.id ?? p.creatorId ?? "",
    title: p.title,
    description: p.description,
    image: p.image,
    isLocked: p.isLocked,
    price: p.price != null ? parseFloat(p.price) : undefined,
    likes: p.likes,
    tags: p.tags ?? [],
    createdAt: p.createdAt,
  }
}

export async function getMyPosts(token: string): Promise<Post[]> {
  const res = await fetch("/api/posts/mine", {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Erreur lors du chargement des posts")
  const data = await res.json()
  return data.map(mapPost)
}

export async function createPost(dto: CreatePostDto, token: string): Promise<Post> {
  const res = await fetch("/api/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dto),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? "Erreur lors de la création du post")
  }
  return mapPost(await res.json())
}

export async function updatePost(id: string, dto: UpdatePostDto, token: string): Promise<Post> {
  const res = await fetch(`/api/posts/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dto),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? "Erreur lors de la mise à jour du post")
  }
  return mapPost(await res.json())
}

export async function deletePost(id: string, token: string): Promise<void> {
  const res = await fetch(`/api/posts/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Erreur lors de la suppression du post")
}

export async function becomeCreator(
  data: { displayName: string; bio: string; subscriptionPrice: number },
  token: string
): Promise<{ creatorId: string }> {
  const res = await fetch("/api/creators", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? "Erreur lors de la création du profil créateur")
  }
  return res.json()
}
