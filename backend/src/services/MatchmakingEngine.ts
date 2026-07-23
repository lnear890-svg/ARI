import { CALL_CONFIG } from '@ari/shared'

export class MatchmakingEngine {
  private waitingQueue: string[] = []
  private userCalls: Map<string, { count: number; resetTime: number }> = new Map()
  private activePairs: Map<string, string> = new Map()

  findMatch(userId: string): string | null {
    // Check rate limit
    const callCount = this.userCalls.get(userId)
    if (callCount && callCount.count >= CALL_CONFIG.MAX_CALLS_PER_HOUR) {
      if (Date.now() < callCount.resetTime) {
        return null
      } else {
        // Reset call count
        this.userCalls.delete(userId)
      }
    }

    // Find next user in queue
    const matchIndex = this.waitingQueue.findIndex((id) => id !== userId)
    if (matchIndex !== -1) {
      const match = this.waitingQueue[matchIndex]
      this.waitingQueue.splice(matchIndex, 1)
      this.activePairs.set(userId, match)
      this.activePairs.set(match, userId)
      return match
    }

    // Add to queue
    this.waitingQueue.push(userId)
    return null
  }

  recordCall(userId: string): void {
    const callCount = this.userCalls.get(userId) || {
      count: 0,
      resetTime: Date.now() + 60 * 60 * 1000,
    }
    callCount.count += 1
    this.userCalls.set(userId, callCount)
  }

  removeFromQueue(userId: string): void {
    const index = this.waitingQueue.indexOf(userId)
    if (index !== -1) {
      this.waitingQueue.splice(index, 1)
    }

    // Remove pair
    const pair = this.activePairs.get(userId)
    if (pair) {
      this.activePairs.delete(userId)
      this.activePairs.delete(pair)
    }
  }

  getQueueLength(): number {
    return this.waitingQueue.length
  }
}

export default new MatchmakingEngine()
