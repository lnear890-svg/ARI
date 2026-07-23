import React, { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCallStore } from '../store/callStore'
import { useWebRTC } from '../hooks/useWebRTC'
import { useSocket } from '../hooks/useSocket'
import { SOCKET_EVENTS } from '@ari/shared'

export default function CallInterface() {
  const { callId } = useParams<{ callId: string }>()
  const navigate = useNavigate()
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const callStartTimeRef = useRef<number>(0)

  const store = useCallStore()
  const webrtc = useWebRTC()
  const socket = useSocket()
  const [messageInput, setMessageInput] = React.useState('')

  useEffect(() => {
    if (!callId) return

    callStartTimeRef.current = Date.now()

    const initializeCall = async () => {
      try {
        store.setLoading(true)
        const stream = await webrtc.initializeLocalStream(true, store.callMode === 'video')

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        webrtc.createPeerConnection((candidate) => {
          socket.emit(SOCKET_EVENTS.SIGNAL_ICE, {
            to: store.remoteUser?.id,
            callId,
            candidate: candidate.toJSON(),
          })
        })

        const offer = await webrtc.createOffer()
        socket.emit(SOCKET_EVENTS.SIGNAL_OFFER, {
          to: store.remoteUser?.id,
          callId,
          offer,
        })

        store.setLoading(false)
      } catch (error) {
        console.error('Failed to initialize call:', error)
        store.setError('Failed to initialize call')
        store.setLoading(false)
      }
    }

    socket.on(SOCKET_EVENTS.SIGNAL_ANSWER, async (data: any) => {
      try {
        await webrtc.setRemoteDescription(data.answer)
      } catch (error) {
        console.error('Failed to set remote description:', error)
      }
    })

    socket.on(SOCKET_EVENTS.SIGNAL_ICE, async (data: any) => {
      try {
        await webrtc.addIceCandidate(data.candidate)
      } catch (error) {
        console.error('Failed to add ICE candidate:', error)
      }
    })

    initializeCall()

    return () => {
      webrtc.cleanup()
      socket.off(SOCKET_EVENTS.SIGNAL_ANSWER)
      socket.off(SOCKET_EVENTS.SIGNAL_ICE)
    }
  }, [callId, store.callMode])

  useEffect(() => {
    if (webrtc.remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = webrtc.remoteStream
    }
  }, [webrtc.remoteStream])

  const handleEndCall = () => {
    const duration = Date.now() - callStartTimeRef.current
    socket.emit(SOCKET_EVENTS.CALL_END, {
      callId,
      to: store.remoteUser?.id,
    })
    store.reset()
    webrtc.cleanup()
    navigate('/')
  }

  const handleSendMessage = () => {
    if (messageInput.trim() && callId) {
      socket.emit(SOCKET_EVENTS.MESSAGE_SEND, {
        callId,
        text: messageInput,
      })
      store.addMessage(`You: ${messageInput}`)
      setMessageInput('')
    }
  }

  return (
    <div className="h-screen bg-slate-900 flex">
      {/* Video Container */}
      <div className="flex-1 relative bg-black">
        {/* Remote Video */}
        <div className="w-full h-full">
          <video
            ref={remoteVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
          />
        </div>

        {/* Local Video */}
        <div className="absolute bottom-4 right-4 w-32 h-32 rounded-lg overflow-hidden border-2 border-cyan-400 shadow-lg">
          <video
            ref={localVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
        </div>

        {/* Call Duration */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
          <p className="text-sm font-semibold">Call Duration: <span id="duration">00:00</span></p>
        </div>

        {/* Controls */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4">
          <button
            onClick={() => {
              store.toggleMic()
              webrtc.toggleAudio(store.isMicOn)
            }}
            className={`p-4 rounded-full transition transform hover:scale-110 ${
              store.isMicOn
                ? 'bg-slate-700 hover:bg-slate-600'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a3 3 0 00-3 3v4a3 3 0 006 0V5a3 3 0 00-3-3z" />
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a1 1 0 11-2 0V7a3 3 0 00-6 0v2a1 1 0 11-2 0z" clipRule="evenodd" />
            </svg>
          </button>

          {store.callMode === 'video' && (
            <button
              onClick={() => {
                store.toggleCamera()
                webrtc.toggleVideo(store.isCameraOn)
              }}
              className={`p-4 rounded-full transition transform hover:scale-110 ${
                store.isCameraOn
                  ? 'bg-slate-700 hover:bg-slate-600'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm4 2v4h8V8H6z" />
              </svg>
            </button>
          )}

          <button
            onClick={handleEndCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition transform hover:scale-110"
          >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat Sidebar */}
      <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-white font-bold">Chat</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {store.messages.map((msg, idx) => (
            <div key={idx} className="bg-slate-700 rounded p-3 text-white text-sm break-words">
              {msg}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-700 flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-slate-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <button
            onClick={handleSendMessage}
            className="p-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-2.976 5.951 2.976a1 1 0 001.169-1.409l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
