# ARI Architecture

## System Overview

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Frontend      │         │   Backend        │         │   Firebase      │
│   (React)       │◄───────►│   (Node.js)      │◄───────►│   (Database)    │
│                 │         │                  │         │                 │
│ - UI Components │         │ - WebSocket API  │         │ - User Sessions │
│ - WebRTC Peer   │         │ - Matchmaking    │         │ - Call Metadata │
│ - Socket.io     │         │ - Signaling      │         │ - Analytics     │
└─────────────────┘         └──────────────────┘         └─────────────────┘
        │                            │
        └────────────────┬───────────┘
                         │
                    WebRTC P2P
                  (Media Stream)
```

## Component Architecture

### Frontend Components

```
App
├── Layout
│   ├── Header
│   └── Navigation
├── Pages
│   ├── Landing
│   ├── CallInterface
│   │   ├── VideoContainer
│   │   ├── MediaControls
│   │   ├── ChatBox
│   │   └── UserInfo
│   └── Profile
└── Services
    ├── SocketService
    ├── WebRTCService
    └── FirebaseService
```

### Backend Services

```
ExpressApp
├── Socket.io Server
│   ├── UserManager
│   ├── MatchmakingEngine
│   ├── SignalingHandler
│   └── MessageHandler
├── REST API Routes
│   ├── /api/users
│   ├── /api/calls
│   └── /api/analytics
└── Database
    ├── Firebase Admin SDK
    └── Connection Pool
```

## Data Flow

### 1. User Connection
```
User Opens App → Socket.io Connect → Firebase Session Created → User Online
```

### 2. Matchmaking Flow
```
Click "Start Call" → MatchmakingEngine → Find Available User → Create Call Room
```

### 3. Signaling Flow
```
User A → Backend → User B (SDP Offer)
User B → Backend → User A (SDP Answer)
User A → Backend → User B (ICE Candidates)
User B → Backend → User A (ICE Candidates)
```

### 4. Media Flow
```
WebRTC P2P Connection → Direct Stream Exchange (No Server)
```

### 5. Chat Flow
```
Message Input → Socket.io Emit → Backend Relay → Other User Socket
```

## Database Schema

### Firebase Realtime Database

```
Users/
  ├── userId
  │   ├── name: string
  │   ├── status: "online" | "calling" | "offline"
  │   ├── createdAt: timestamp
  │   └── lastSeen: timestamp

Calls/
  ├── callId
  │   ├── initiator: userId
  │   ├── receiver: userId
  │   ├── mode: "video" | "voice"
  │   ├── status: "pending" | "active" | "ended"
  │   ├── startTime: timestamp
  │   ├── endTime: timestamp
  │   └── messages: [...]

Messages/
  ├── callId
  │   └── messageId
  │       ├── sender: userId
  │       ├── text: string
  │       └── timestamp: timestamp
```

## Security Considerations

- **CORS**: Whitelist specific origins
- **Rate Limiting**: 10 calls/hour per user
- **Input Validation**: All server-side validation
- **WebRTC**: P2P encrypted media
- **No Data Storage**: Messages not permanently stored
- **HTTPS Only**: Secure connections

## Scalability

- **Database**: Firebase auto-scales with usage
- **Backend**: Horizontal scaling with load balancer
- **Frontend**: CDN distribution via Vercel
- **WebRTC**: P2P reduces server load

## Deployment Pipeline

```
Git Push → GitHub Actions → Build & Test → Deploy to Vercel/Railway
```
