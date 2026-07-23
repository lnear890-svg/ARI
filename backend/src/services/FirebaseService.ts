import { db } from '../config/firebase'
import { User, Call, Message } from '@ari/shared'
import { v4 as uuidv4 } from 'uuid'

export class FirebaseService {
  // User operations
  async createUser(userId: string, userData: Partial<User>): Promise<User> {
    const user: User = {
      id: userId,
      name: userData.name || 'Anonymous',
      status: 'online',
      createdAt: Date.now(),
      lastSeen: Date.now(),
    }
    await db.ref(`users/${userId}`).set(user)
    return user
  }

  async getUser(userId: string): Promise<User | null> {
    const snapshot = await db.ref(`users/${userId}`).get()
    return snapshot.val()
  }

  async updateUserStatus(userId: string, status: 'online' | 'calling' | 'offline'): Promise<void> {
    await db.ref(`users/${userId}/status`).set(status)
  }

  async getOnlineUsers(): Promise<User[]> {
    const snapshot = await db.ref('users').orderByChild('status').equalTo('online').get()
    const users: User[] = []
    snapshot.forEach((child) => {
      users.push(child.val())
    })
    return users
  }

  // Call operations
  async createCall(initiatorId: string, receiverId: string, mode: 'video' | 'voice'): Promise<Call> {
    const callId = uuidv4()
    const call: Call = {
      id: callId,
      initiator: initiatorId,
      receiver: receiverId,
      mode,
      status: 'pending',
      messages: [],
      startTime: Date.now(),
    }
    await db.ref(`calls/${callId}`).set(call)
    return call
  }

  async getCall(callId: string): Promise<Call | null> {
    const snapshot = await db.ref(`calls/${callId}`).get()
    return snapshot.val()
  }

  async updateCallStatus(callId: string, status: string): Promise<void> {
    await db.ref(`calls/${callId}/status`).set(status)
  }

  async endCall(callId: string, duration: number): Promise<void> {
    await db.ref(`calls/${callId}`).update({
      status: 'ended',
      endTime: Date.now(),
      duration,
    })
  }

  // Message operations
  async addMessage(callId: string, sender: string, text: string): Promise<Message> {
    const messageId = uuidv4()
    const message: Message = {
      id: messageId,
      callId,
      sender,
      text,
      timestamp: Date.now(),
    }
    await db.ref(`calls/${callId}/messages/${messageId}`).set(message)
    return message
  }

  async getCallMessages(callId: string): Promise<Message[]> {
    const snapshot = await db.ref(`calls/${callId}/messages`).get()
    const messages: Message[] = []
    snapshot.forEach((child) => {
      messages.push(child.val())
    })
    return messages.sort((a, b) => a.timestamp - b.timestamp)
  }

  // Analytics
  async recordCallAnalytics(callId: string, initiatorId: string, receiverId: string, duration: number): Promise<void> {
    const timestamp = Date.now()
    await db.ref(`analytics/calls/${callId}`).set({
      initiator: initiatorId,
      receiver: receiverId,
      duration,
      timestamp,
    })
  }

  async getAnalytics(): Promise<any> {
    const snapshot = await db.ref('analytics').get()
    return snapshot.val()
  }
}

export default new FirebaseService()
