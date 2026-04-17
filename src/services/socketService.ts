import { io, Socket } from "socket.io-client"
import type { Message } from "../types/Message"

let socket: Socket | null = null

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket

  socket = io("/chat", {
    auth: { token },
    transports: ["websocket", "polling"],
  })

  return socket
}

export function disconnectSocket(): void {
  socket?.disconnect()
  socket = null
}

export function getSocket(): Socket | null {
  return socket
}

export function sendMessage(
  receiverId: string,
  content: string,
  type: 'text' | 'file' = 'text',
  fileName?: string,
): void {
  socket?.emit('send_message', { receiverId, content, type, fileName })
}

export function onNewMessage(handler: (msg: Message) => void): () => void {
  socket?.on('new_message', handler)
  socket?.on('message_sent', handler)
  return () => {
    socket?.off('new_message', handler)
    socket?.off('message_sent', handler)
  }
}

export function requestCall(targetUserId: string, roomUrl: string): void {
  socket?.emit('call_request', { targetUserId, roomUrl })
}

export function acceptCall(targetUserId: string): void {
  socket?.emit('call_accepted', { targetUserId })
}

export function rejectCall(targetUserId: string): void {
  socket?.emit('call_rejected', { targetUserId })
}
