export class UserManager {
  private users: Map<string, any> = new Map()

  addUser(socketId: string, userId: string): void {
    this.users.set(socketId, {
      socketId,
      userId,
      status: 'online',
      joinedAt: Date.now(),
    })
  }

  removeUser(socketId: string): void {
    this.users.delete(socketId)
  }

  getAvailableUsers(): string[] {
    return Array.from(this.users.values())
      .filter((user) => user.status === 'online')
      .map((user) => user.socketId)
  }
}
