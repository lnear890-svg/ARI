import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function CallInterface() {
  const { callId } = useParams<{ callId: string }>()
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isCameraOn, setIsCameraOn] = useState(true)

  const toggleMic = () => setIsMicOn(!isMicOn)
  const toggleCamera = () => setIsCameraOn(!isCameraOn)
  const endCall = () => console.log('Ending call')

  return (
    <div className="h-screen bg-slate-900 flex">
      <div className="flex-1 relative bg-black">
        <video ref={remoteVideoRef} className="w-full h-full object-cover" autoPlay playsInline />
        
        <div className="absolute bottom-4 right-4 w-32 h-32 rounded-lg overflow-hidden border-2 border-cyan-400">
          <video ref={localVideoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
        </div>

        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4">
          <button onClick={toggleMic} className="p-4 rounded-full bg-slate-700 hover:bg-slate-600 transition">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a3 3 0 00-3 3v4a3 3 0 006 0V5a3 3 0 00-3-3z" />
            </svg>
          </button>
          
          <button onClick={toggleCamera} className="p-4 rounded-full bg-slate-700 hover:bg-slate-600 transition">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
          </button>
          
          <button onClick={endCall} className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
