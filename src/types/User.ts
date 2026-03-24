export interface User {
  id: string
  email: string
  username: string
  avatar?: string
  bio?: string
  subscribedTo: string[]
  creatorId?: string
  allowVideoCall?: boolean
}
