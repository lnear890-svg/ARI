import { db } from '../config/firebase'
import { User } from '@ari/shared'

interface UserSession {
  socketId: string
  userId: string
  status: 'online' | 'calling' | 'offline'
  joinedAt: number
}

export class UserManager {
  private users: Map<string, UserSession> = new Map()

  async addUser(socketId: string, userId: string): Promise<UserSession> {
    const session: UserSession = {
      socketId,
      userId,
      status: 'online',
      joinedAt: Date.now(),
    }
    this.users.set(socketId, session)

    // Update Firebase
    await db.ref(`users/${userId}/status`).set('online')
    await db.ref(`users/${userId}/lastSeen`).set(Date.now())

    return session
  }

  async removeUser(socketId: string): Promise<void> {
    const user = this.users.get(socketId)
    if (user) {
      await db.ref(`users/${user.userId}/status`).set('offline')
      this.users.delete(socketId)
    }
  }

  getUser(socketId: string): UserSession | undefined {
    return this.users.get(socketId)
  }

  async setUserStatus(socketId: string, status: 'online' | 'calling' | 'offline'): Promise<void> {
    const user = this.users.get(socketId)
    if (user) {
      user.status = status
      await db.ref(`users/${user.userId}/status`).set(status)
    }
  }

  getAvailableUsers(): string[] {
    return Array.from(this.users.values())
      .filter((user) => user.status === 'online')
      .map((user) => user.socketId)
  }

  getAllUsers(): UserSession[] {
    return Array.from(this.users.values())
  }

  getUserBySocketId(socketId: string): UserSession | undefined {
    return this.users.get(socketId)
  }
}

export default new UserManager()
