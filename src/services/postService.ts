import type { Post } from "../types/Post"
import type { Creator } from "../types/Creator"

interface ApiCreator {
  id: string
  username: string
  displayName: string
  avatar?: string
  coverImage?: string
  bio?: string
  subscriptionPrice: string | number
  isPremium: boolean
}

interface ApiPost {
  id: string
  creator?: ApiCreator
  creatorId?: string
  title: string
  description: string
  image: string
  isLocked: boolean
  price?: string | number | null
  likes: number
  tags?: string[]
  createdAt: string
}

function mapCreator(c: ApiCreator): Creator {
  return {
    id: c.id,
    username: c.username,
    displayName: c.displayName,
    avatar: c.avatar ?? "",
    coverImage: c.coverImage ?? "",
    bio: c.bio ?? "",
    subscriptionPrice: Number.parseFloat(String(c.subscriptionPrice)),
    isPremium: c.isPremium,
  }
}

export async function getPosts(token?: string | null): Promise<{ posts: Post[]; creators: Creator[] }> {
  const res = await fetch("/api/posts", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error("Erreur lors du chargement des posts")
  const data: ApiPost[] = await res.json()
  const creators: Creator[] = []
  const seenIds = new Set<string>()
  const posts = data.map((p) => {
    if (p.creator && !seenIds.has(p.creator.id)) {
      seenIds.add(p.creator.id)
      creators.push(mapCreator(p.creator))
    }
    return mapPost(p)
  })
  return { posts, creators }
}

interface CreatePostDto {
  title: string
  description: string
  image: string
  isLocked: boolean
  price?: number
  tags: string[]
}

type UpdatePostDto = Partial<CreatePostDto>

function mapPost(p: ApiPost): Post {
  return {
    id: p.id,
    creatorId: p.creator?.id ?? p.creatorId ?? "",
    title: p.title,
    description: p.description,
    image: p.image,
    isLocked: p.isLocked,
    price: p.price !== null && p.price !== undefined ? Number(p.price) : undefined,
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
