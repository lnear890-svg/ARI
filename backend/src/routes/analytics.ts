import express, { Request, Response } from 'express'
import firebaseService from '../services/FirebaseService'

const router = express.Router()

// Add message to call
router.post('/:callId/message', async (req: Request, res: Response) => {
  try {
    const { sender, text } = req.body
    if (!sender || !text) {
      return res.status(400).json({ success: false, error: 'Missing required fields' })
    }
    const message = await firebaseService.addMessage(req.params.callId, sender, text)
    res.status(201).json({ success: true, data: message })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to send message' })
  }
})

// Get analytics
router.get('/data/summary', async (req: Request, res: Response) => {
  try {
    const analytics = await firebaseService.getAnalytics()
    res.json({ success: true, data: analytics })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' })
  }
})

export default router
