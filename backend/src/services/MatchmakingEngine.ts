export class MatchmakingEngine {
  private waitingQueue: string[] = []

  findMatch(userId: string): string | null {
    const matchIndex = this.waitingQueue.findIndex((id) => id !== userId)
    if (matchIndex !== -1) {
      const match = this.waitingQueue[matchIndex]
      this.waitingQueue.splice(matchIndex, 1)
      return match
    }
    this.waitingQueue.push(userId)
    return null
  }

  removeFromQueue(userId: string): void {
    const index = this.waitingQueue.indexOf(userId)
    if (index !== -1) {
      this.waitingQueue.splice(index, 1)
    }
  }
}
