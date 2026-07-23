import { useEffect, useRef } from 'react'
import socketService from '../services/socketService'
import { SOCKET_EVENTS } from '@ari/shared'

export const useSocket = () => {
  const socketRef = useRef(socketService)

  useEffect(() => {
    socketRef.current.connect().catch((err) => {
      console.error('Failed to connect socket:', err)
    })

    return () => {
      socketRef.current.disconnect()
    }
  }, [])

  const emit = (event: string, data?: any) => {
    socketRef.current.emit(event, data)
  }

  const on = (event: string, callback: (...args: any[]) => void) => {
    socketRef.current.on(event, callback)
  }

  const off = (event: string, callback?: (...args: any[]) => void) => {
    socketRef.current.off(event, callback)
  }

  return { emit, on, off }
}
