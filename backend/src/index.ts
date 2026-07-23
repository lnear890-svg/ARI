import express from 'express'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import './config/firebase'
import userRoutes from './routes/users'
import callRoutes from './routes/calls'
import analyticsRoutes from './routes/analytics'
import UserManager from './services/UserManager'
import MatchmakingEngine from './services/MatchmakingEngine'
import FirebaseService from './services/FirebaseService'
import { SignalingHandler } from './handlers/SignalingHandler'
import { SOCKET_EVENTS, CALL_CONFIG } from '@ari/shared'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
})

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

app.use('/api/users', userRoutes)
app.use('/api/calls', callRoutes)
app.use('/api/analytics', analyticsRoutes)

// Services
const signalingHandler = new SignalingHandler(io)
const userCallStartTimes: Map<string, number> = new Map()

// Socket.io events
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)

  // User join
  socket.on(SOCKET_EVENTS.USER_JOIN, async (userId: string) => {
    try {
      const userData = await FirebaseService.getUser(userId)
      if (!userData) {
        await FirebaseService.createUser(userId, { name: `User_${userId.slice(0, 5)}` })
      }
      await UserManager.addUser(socket.id, userId)
      const availableUsers = UserManager.getAvailableUsers()
      io.emit(SOCKET_EVENTS.USERS_AVAILABLE, availableUsers)
      console.log(`User ${userId} joined (Socket: ${socket.id})`)
    } catch (error) {
      console.error('Error on user join:', error)
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to join', code: 'JOIN_ERROR' })
    }
  })

  // Call request
  socket.on(SOCKET_EVENTS.CALL_REQUEST, async (data: { mode: string }) => {
    try {
      const user = UserManager.getUser(socket.id)
      if (!user) {
        return socket.emit(SOCKET_EVENTS.ERROR, { message: 'User not found', code: 'USER_NOT_FOUND' })
      }

      const receiver = MatchmakingEngine.findMatch(socket.id)
      if (receiver) {
        const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const receiverUser = UserManager.getUser(receiver)

        if (receiverUser) {
          MatchmakingEngine.recordCall(socket.id)
          await FirebaseService.createCall(user.userId, receiverUser.userId, data.mode)
          await UserManager.setUserStatus(socket.id, 'calling')
          await UserManager.setUserStatus(receiver, 'calling')

          userCallStartTimes.set(callId, Date.now())

          io.to(receiver).emit(SOCKET_EVENTS.CALL_REQUEST, {
            from: socket.id,
            callId,
            mode: data.mode,
          })
          socket.emit('call:matched', { callId })
        }
      } else {
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'No available users',
          code: 'NO_AVAILABLE_USERS',
        })
      }
    } catch (error) {
      console.error('Error on call request:', error)
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Call request failed', code: 'CALL_REQUEST_ERROR' })
    }
  })

  // Call accept
  socket.on(SOCKET_EVENTS.CALL_ACCEPT, (data: { callId: string; from: string }) => {
    try {
      io.to(data.from).emit(SOCKET_EVENTS.CALL_ACCEPT, { callId: data.callId })
      console.log(`Call ${data.callId} accepted`)
    } catch (error) {
      console.error('Error accepting call:', error)
    }
  })

  // Call reject
  socket.on(SOCKET_EVENTS.CALL_REJECT, async (data: { callId: string; from: string; reason: string }) => {
    try {
      const user = UserManager.getUser(socket.id)
      if (user) {
        await UserManager.setUserStatus(socket.id, 'online')
        const receiverUser = UserManager.getUser(data.from)
        if (receiverUser) {
          await UserManager.setUserStatus(data.from, 'online')
        }
      }
      io.to(data.from).emit(SOCKET_EVENTS.CALL_REJECT, { callId: data.callId, reason: data.reason })
      console.log(`Call ${data.callId} rejected: ${data.reason}`)
    } catch (error) {
      console.error('Error rejecting call:', error)
    }
  })

  // Call end
  socket.on(SOCKET_EVENTS.CALL_END, async (data: { callId: string; to?: string }) => {
    try {
      const user = UserManager.getUser(socket.id)
      if (user) {
        await UserManager.setUserStatus(socket.id, 'online')
      }

      const startTime = userCallStartTimes.get(data.callId)
      if (startTime) {
        const duration = Date.now() - startTime
        await FirebaseService.endCall(data.callId, duration)
        userCallStartTimes.delete(data.callId)
      }

      if (data.to) {
        io.to(data.to).emit(SOCKET_EVENTS.CALL_END, { callId: data.callId })
      }
      console.log(`Call ${data.callId} ended`)
    } catch (error) {
      console.error('Error ending call:', error)
    }
  })

  // Signaling - Offer
  socket.on(SOCKET_EVENTS.SIGNAL_OFFER, (data: { to: string; callId: string; offer: any }) => {
    try {
      signalingHandler.handleOffer(socket.id, data)
    } catch (error) {
      console.error('Error handling offer:', error)
    }
  })

  // Signaling - Answer
  socket.on(SOCKET_EVENTS.SIGNAL_ANSWER, (data: { to: string; callId: string; answer: any }) => {
    try {
      signalingHandler.handleAnswer(socket.id, data)
    } catch (error) {
      console.error('Error handling answer:', error)
    }
  })

  // Signaling - ICE Candidate
  socket.on(SOCKET_EVENTS.SIGNAL_ICE, (data: { to: string; callId: string; candidate: any }) => {
    try {
      signalingHandler.handleIceCandidate(socket.id, data)
    } catch (error) {
      console.error('Error handling ICE candidate:', error)
    }
  })

  // Message
  socket.on(SOCKET_EVENTS.MESSAGE_SEND, async (data: { callId: string; text: string }) => {
    try {
      const user = UserManager.getUser(socket.id)
      if (user && data.text.trim()) {
        const message = await FirebaseService.addMessage(data.callId, user.userId, data.text)
        io.emit(SOCKET_EVENTS.MESSAGE_RECEIVE, message)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  })

  // Disconnect
  socket.on(SOCKET_EVENTS.DISCONNECT, async () => {
    try {
      const user = UserManager.getUser(socket.id)
      if (user) {
        console.log(`User disconnected: ${user.userId}`)
        MatchmakingEngine.removeFromQueue(socket.id)
        await UserManager.removeUser(socket.id)
        const availableUsers = UserManager.getAvailableUsers()
        io.emit(SOCKET_EVENTS.USERS_AVAILABLE, availableUsers)
      }
    } catch (error) {
      console.error('Error on disconnect:', error)
    }
  })
})

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`🚀 ARI Backend running on port ${PORT}`)
  console.log(`📡 WebSocket server ready`)
  console.log(`🔗 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
})

export { app, httpServer, io }
