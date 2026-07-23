import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCallStore } from '../store/callStore'
import { useSocket } from '../hooks/useSocket'
import { SOCKET_EVENTS } from '@ari/shared'
import { v4 as uuidv4 } from 'uuid'

export default function Landing() {
  const navigate = useNavigate()
  const store = useCallStore()
  const socket = useSocket()
  const [isSearching, setIsSearching] = useState(false)
  const [incomingCall, setIncomingCall] = useState<any>(null)
  const userId = React.useRef(uuidv4())

  useEffect(() => {
    // Join the network
    socket.emit(SOCKET_EVENTS.USER_JOIN, userId.current)
    store.setCurrentUser({ 
      id: userId.current, 
      name: `User_${userId.current.slice(0, 5)}`,
      status: 'online',
      createdAt: Date.now(),
      lastSeen: Date.now(),
    })

    // Listen for incoming calls
    socket.on(SOCKET_EVENTS.CALL_REQUEST, (data: any) => {
      setIncomingCall(data)
    })

    socket.on(SOCKET_EVENTS.USERS_AVAILABLE, (users: string[]) => {
      console.log('Available users:', users.length)
    })

    return () => {
      socket.off(SOCKET_EVENTS.CALL_REQUEST)
      socket.off(SOCKET_EVENTS.USERS_AVAILABLE)
    }
  }, [])

  const startCall = (mode: 'video' | 'voice') => {
    setIsSearching(true)
    store.setCallMode(mode)
    store.setLoading(true)

    // Request a call
    socket.emit(SOCKET_EVENTS.CALL_REQUEST, { mode })

    // Listen for match
    socket.once('call:matched', (data: any) => {
      store.setCurrentCall({ 
        id: data.callId,
        initiator: userId.current,
        receiver: '',
        mode,
        status: 'active',
        messages: [],
      })
      navigate(`/call/${data.callId}`)
    })
  }

  const acceptCall = () => {
    if (!incomingCall) return

    store.setCallMode(incomingCall.mode)
    store.setCurrentCall({ 
      id: incomingCall.callId,
      initiator: incomingCall.from,
      receiver: userId.current,
      mode: incomingCall.mode,
      status: 'active',
      messages: [],
    })

    socket.emit(SOCKET_EVENTS.CALL_ACCEPT, {
      callId: incomingCall.callId,
      from: incomingCall.from,
    })

    setIncomingCall(null)
    navigate(`/call/${incomingCall.callId}`)
  }

  const rejectCall = () => {
    if (!incomingCall) return
    socket.emit(SOCKET_EVENTS.CALL_REJECT, {
      callId: incomingCall.callId,
      from: incomingCall.from,
      reason: 'User rejected call',
    })
    setIncomingCall(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-8 text-center max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4">Incoming Call</h2>
            <p className="text-slate-300 mb-6">
              {incomingCall.mode === 'video' ? '📹 Video Call' : '🔊 Voice Call'}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={acceptCall}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition"
              >
                Accept
              </button>
              <button
                onClick={rejectCall}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center">
        <div className="mb-8 inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
        
        <h1 className="text-5xl font-bold text-white mb-4">Welcome to ARI</h1>
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Connect with random people around the world through video or voice calls. Meet new friends instantly!
        </p>
        
        {!isSearching && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => startCall('video')}
              disabled={store.isLoading}
              className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition transform hover:scale-105 disabled:opacity-50"
            >
              🎥 Video Call
            </button>
            <button
              onClick={() => startCall('voice')}
              disabled={store.isLoading}
              className="px-8 py-4 bg-gradient-to-r from-purple-400 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-105 disabled:opacity-50"
            >
              🔊 Voice Call
            </button>
          </div>
        )}

        {isSearching && (
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 rounded-lg">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className="text-white font-semibold">Searching for someone...</span>
            </div>
          </div>
        )}

        {store.error && (
          <div className="mb-4 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-300">
            {store.error}
          </div>
        )}
      </div>
    </div>
  )
}
