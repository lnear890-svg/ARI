import { Server as SocketIOServer } from 'socket.io'

export class SignalingHandler {
  private io: SocketIOServer
  private peerConnections: Map<string, Set<string>> = new Map()

  constructor(io: SocketIOServer) {
    this.io = io
  }

  handleOffer(from: string, data: { to: string; callId: string; offer: any }): void {
    this.io.to(data.to).emit('signal:offer', {
      from,
      callId: data.callId,
      offer: data.offer,
    })
    this.recordConnection(from, data.to)
  }

  handleAnswer(from: string, data: { to: string; callId: string; answer: any }): void {
    this.io.to(data.to).emit('signal:answer', {
      from,
      callId: data.callId,
      answer: data.answer,
    })
  }

  handleIceCandidate(from: string, data: { to: string; callId: string; candidate: any }): void {
    this.io.to(data.to).emit('signal:ice', {
      from,
      callId: data.callId,
      candidate: data.candidate,
    })
  }

  private recordConnection(userId1: string, userId2: string): void {
    if (!this.peerConnections.has(userId1)) {
      this.peerConnections.set(userId1, new Set())
    }
    this.peerConnections.get(userId1)!.add(userId2)
  }
}
