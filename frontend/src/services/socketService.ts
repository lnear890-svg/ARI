import io, { Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null
  private url: string

  constructor(url: string = 'http://localhost:3001') {
    this.url = url
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.url, {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        })

        this.socket.on('connect', () => {
          console.log('Socket connected')
          resolve()
        })

        this.socket.on('error', (error) => {
          console.error('Socket error:', error)
          reject(error)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  emit(event: string, data?: unknown): void {
    if (this.socket) {
      this.socket.emit(event, data)
    }
  }

  on(event: string, callback: (...args: unknown[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }
}

export default new SocketService()
