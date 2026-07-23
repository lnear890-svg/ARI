import { Server as SocketIOServer } from 'socket.io'

export class SignalingHandler {
  private io: SocketIOServer

  constructor(io: SocketIOServer) {
    this.io = io
  }

  handleOffer(from: string, data: { to: string; callId: string; offer: any }): void {
    this.io.to(data.to).emit('signal:offer', {
      from,
      callId: data.callId,
      offer: data.offer,
    })
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
}
