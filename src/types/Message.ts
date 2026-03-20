export type MessageType = 'text' | 'file'

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string | null
  type: MessageType
  fileName: string | null
  createdAt: string
}

export interface Conversation {
  userId: string
  username: string
  avatar: string | null
  lastMessage: Message
}
