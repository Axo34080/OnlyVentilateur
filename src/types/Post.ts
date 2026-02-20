export interface Post {
  id: string
  creatorId: string
  title: string
  description: string
  image: string
  isLocked: boolean
  price?: number
  likes: number
  createdAt: string
  tags: string[]
}
