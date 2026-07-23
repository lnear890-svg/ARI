import axios, { AxiosInstance } from 'axios'
import { User, Call, Message } from '@ari/shared'

class APIClient {
  private client: AxiosInstance

  constructor(baseURL: string = 'http://localhost:3001/api') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  // User API
  async getOnlineUsers(): Promise<User[]> {
    const response = await this.client.get('/users/online')
    return response.data.data
  }

  async getUser(userId: string): Promise<User> {
    const response = await this.client.get(`/users/${userId}`)
    return response.data.data
  }

  async updateUserStatus(userId: string, status: 'online' | 'calling' | 'offline'): Promise<void> {
    await this.client.put(`/users/${userId}/status`, { status })
  }

  // Call API
  async createCall(initiatorId: string, receiverId: string, mode: 'video' | 'voice'): Promise<Call> {
    const response = await this.client.post('/calls', { initiatorId, receiverId, mode })
    return response.data.data
  }

  async getCall(callId: string): Promise<Call> {
    const response = await this.client.get(`/calls/${callId}`)
    return response.data.data
  }

  async endCall(callId: string, duration: number): Promise<void> {
    await this.client.put(`/calls/${callId}/end`, { duration })
  }

  async getCallMessages(callId: string): Promise<Message[]> {
    const response = await this.client.get(`/calls/${callId}/messages`)
    return response.data.data
  }

  // Message API
  async addMessage(callId: string, sender: string, text: string): Promise<Message> {
    const response = await this.client.post(`/analytics/${callId}/message`, { sender, text })
    return response.data.data
  }

  // Analytics API
  async getAnalytics(): Promise<any> {
    const response = await this.client.get('/analytics/data/summary')
    return response.data.data
  }
}

export default new APIClient()
