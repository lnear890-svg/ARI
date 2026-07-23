import express, { Request, Response } from 'express'
import firebaseService from '../services/FirebaseService'

const router = express.Router()

// Get all online users
router.get('/online', async (req: Request, res: Response) => {
  try {
    const users = await firebaseService.getOnlineUsers()
    res.json({ success: true, data: users })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch users' })
  }
})

// Get specific user
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const user = await firebaseService.getUser(req.params.userId)
    if (user) {
      res.json({ success: true, data: user })
    } else {
      res.status(404).json({ success: false, error: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch user' })
  }
})

// Update user status
router.put('/:userId/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body
    if (!['online', 'calling', 'offline'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' })
    }
    await firebaseService.updateUserStatus(req.params.userId, status)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update status' })
  }
})

export default router
