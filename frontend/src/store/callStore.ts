import { create } from 'zustand'
import { User, Call } from '@ari/shared'

interface CallStore {
  currentCall: Call | null
  currentUser: User | null
  remoteUser: User | null
  onlineUsers: User[]
  messages: string[]
  isMicOn: boolean
  isCameraOn: boolean
  callMode: 'video' | 'voice'
  isLoading: boolean
  error: string | null

  setCurrentCall: (call: Call | null) => void
  setCurrentUser: (user: User | null) => void
  setRemoteUser: (user: User | null) => void
  setOnlineUsers: (users: User[]) => void
  addMessage: (message: string) => void
  clearMessages: () => void
  toggleMic: () => void
  toggleCamera: () => void
  setCallMode: (mode: 'video' | 'voice') => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useCallStore = create<CallStore>((set) => ({
  currentCall: null,
  currentUser: null,
  remoteUser: null,
  onlineUsers: [],
  messages: [],
  isMicOn: true,
  isCameraOn: true,
  callMode: 'video',
  isLoading: false,
  error: null,

  setCurrentCall: (call) => set({ currentCall: call }),
  setCurrentUser: (user) => set({ currentUser: user }),
  setRemoteUser: (user) => set({ remoteUser: user }),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
  toggleMic: () => set((state) => ({ isMicOn: !state.isMicOn })),
  toggleCamera: () => set((state) => ({ isCameraOn: !state.isCameraOn })),
  setCallMode: (mode) => set({ callMode: mode }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () => set({
    currentCall: null,
    remoteUser: null,
    messages: [],
    isMicOn: true,
    isCameraOn: true,
    callMode: 'video',
    error: null,
  }),
}))
