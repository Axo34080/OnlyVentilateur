import { sendIceCandidate, sendOffer, sendAnswer } from './socketService'

type FileProgressCallback = (progress: number) => void
type FileReceiveCallback = (fileName: string, blob: Blob) => void

const CHUNK_SIZE = 16 * 1024 // 16KB chunks

let peerConnection: RTCPeerConnection | null = null
let dataChannel: RTCDataChannel | null = null

let onFileReceive: FileReceiveCallback | null = null

const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }]

export function setFileReceiveHandler(handler: FileReceiveCallback): void {
  onFileReceive = handler
}

export function createPeerConnection(targetUserId: string): RTCPeerConnection {
  peerConnection = new RTCPeerConnection({ iceServers })

  peerConnection.onicecandidate = (e) => {
    if (e.candidate) sendIceCandidate(targetUserId, e.candidate)
  }

  return peerConnection
}

export async function initiateFileTransfer(
  targetUserId: string,
  file: File,
  onProgress: FileProgressCallback,
): Promise<void> {
  const pc = createPeerConnection(targetUserId)

  dataChannel = pc.createDataChannel('file', { ordered: true })

  let offset = 0

  dataChannel.onopen = () => {
    // Send metadata first
    dataChannel!.send(JSON.stringify({ type: 'meta', name: file.name, size: file.size }))

    const sendChunk = () => {
      if (offset >= file.size) return
      const slice = file.slice(offset, offset + CHUNK_SIZE)
      const reader = new FileReader()
      reader.onload = (e) => {
        if (!e.target?.result) return
        dataChannel!.send(e.target.result as ArrayBuffer)
        offset += CHUNK_SIZE
        onProgress(Math.min(100, Math.round((offset / file.size) * 100)))
        if (offset < file.size) sendChunk()
      }
      reader.readAsArrayBuffer(slice)
    }

    sendChunk()
  }

  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)
  sendOffer(targetUserId, offer)
}

export async function handleIncomingOffer(
  targetUserId: string,
  offer: RTCSessionDescriptionInit,
): Promise<void> {
  const pc = createPeerConnection(targetUserId)

  const chunks: ArrayBuffer[] = []
  let fileMetadata: { name: string; size: number } | null = null

  pc.ondatachannel = (e) => {
    const channel = e.channel
    channel.onmessage = (ev) => {
      if (typeof ev.data === 'string') {
        const meta = JSON.parse(ev.data) as { type: string; name: string; size: number }
        if (meta.type === 'meta') fileMetadata = { name: meta.name, size: meta.size }
      } else {
        chunks.push(ev.data as ArrayBuffer)
        const received = chunks.reduce((acc, c) => acc + c.byteLength, 0)
        if (fileMetadata && received >= fileMetadata.size) {
          const blob = new Blob(chunks)
          onFileReceive?.(fileMetadata.name, blob)
          chunks.length = 0
          fileMetadata = null
        }
      }
    }
  }

  await pc.setRemoteDescription(offer)
  const answer = await pc.createAnswer()
  await pc.setLocalDescription(answer)
  sendAnswer(targetUserId, answer)
}

export async function handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
  await peerConnection?.setRemoteDescription(answer)
}

export async function handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
  await peerConnection?.addIceCandidate(new RTCIceCandidate(candidate))
}

export function closePeerConnection(): void {
  dataChannel?.close()
  peerConnection?.close()
  dataChannel = null
  peerConnection = null
}
