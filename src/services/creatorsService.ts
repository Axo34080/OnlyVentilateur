import type { Creator } from "../types/Creator"
import type { Post } from "../types/Post"

export interface CreatorWithPosts extends Creator {
  posts: Post[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPost(p: any, fallbackCreatorId: string): Post {
  return {
    id: p.id,
    creatorId: p.creator?.id ?? fallbackCreatorId,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCreator(c: any): Creator {
  return {
    id: c.id,
    username: c.username,
    displayName: c.displayName,
    avatar: c.avatar ?? "",
    coverImage: c.coverImage ?? "",
    bio: c.bio ?? "",
    subscriptionPrice: parseFloat(c.subscriptionPrice),
    isPremium: c.isPremium,
    subscriberCount: c.subscriberCount ?? 0,
    postCount: c.postCount ?? 0,
  }
}

export async function getLikedPostIds(token: string): Promise<string[]> {
  const res = await fetch("/api/posts/liked", {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return []
  return res.json()
}

export async function getCreators(): Promise<Creator[]> {
  const res = await fetch("/api/creators")
  if (!res.ok) throw new Error("Erreur lors du chargement des créateurs")
  const data = await res.json()
  return data.map(mapCreator)
}

export async function getPostById(id: string): Promise<Post & { creator: Creator }> {
  const res = await fetch(`/api/posts/${id}`)
  if (!res.ok) throw new Error("Post introuvable")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p: any = await res.json()
  return {
    ...mapPost(p, p.creator?.id ?? ""),
    creator: mapCreator(p.creator),
  }
}

export async function getCreatorById(id: string): Promise<CreatorWithPosts> {
  const res = await fetch(`/api/creators/${id}`)
  if (!res.ok) throw new Error("Créateur introuvable")
  const data = await res.json()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const posts: Post[] = (data.posts ?? []).map((p: any) => mapPost(p, data.id))
  return {
    ...mapCreator(data),
    postCount: posts.length,
    posts,
  }
}
