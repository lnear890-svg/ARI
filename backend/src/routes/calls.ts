import express, { Request, Response } from 'express'
import firebaseService from '../services/FirebaseService'

const router = express.Router()

// Create call
router.post('/', async (req: Request, res: Response) => {
  try {
    const { initiatorId, receiverId, mode } = req.body
    if (!initiatorId || !receiverId || !mode) {
      return res.status(400).json({ success: false, error: 'Missing required fields' })
    }
    const call = await firebaseService.createCall(initiatorId, receiverId, mode)
    res.status(201).json({ success: true, data: call })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create call' })
  }
})

// Get call details
router.get('/:callId', async (req: Request, res: Response) => {
  try {
    const call = await firebaseService.getCall(req.params.callId)
    if (call) {
      res.json({ success: true, data: call })
    } else {
      res.status(404).json({ success: false, error: 'Call not found' })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch call' })
  }
})

// End call
router.put('/:callId/end', async (req: Request, res: Response) => {
  try {
    const { duration } = req.body
    if (typeof duration !== 'number') {
      return res.status(400).json({ success: false, error: 'Invalid duration' })
    }
    await firebaseService.endCall(req.params.callId, duration)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to end call' })
  }
})

// Get call messages
router.get('/:callId/messages', async (req: Request, res: Response) => {
  try {
    const messages = await firebaseService.getCallMessages(req.params.callId)
    res.json({ success: true, data: messages })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch messages' })
  }
})

export default router
