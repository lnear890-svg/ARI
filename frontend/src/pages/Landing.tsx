import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  const startCall = () => {
    navigate('/call/demo-call-id')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8 inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
        
        <h1 className="text-5xl font-bold text-white mb-4">Welcome to ARI</h1>
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Connect with random people around the world through video or voice calls.
        </p>
        
        <button
          onClick={startCall}
          className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg transition"
        >
          Start Random Call
        </button>
      </div>
    </div>
  )
}
