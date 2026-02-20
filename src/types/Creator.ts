export interface Creator {
  id: string
  username: string
  displayName: string
  avatar: string
  coverImage: string
  bio: string
  subscriberCount?: number
  postCount?: number
  subscriptionPrice: number
  isPremium: boolean
}
