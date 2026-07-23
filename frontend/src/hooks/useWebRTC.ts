import { useEffect, useRef, useState } from 'react'
import { ICE_SERVERS, WEBRTC_CONFIG } from '@ari/shared'

export const useWebRTC = () => {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  const initializeLocalStream = async (audio: boolean, video: boolean) => {
    try {
      const constraints = {
        audio: audio ? WEBRTC_CONFIG.audio : false,
        video: video ? WEBRTC_CONFIG.video : false,
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      localStreamRef.current = stream
      setLocalStream(stream)
      return stream
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to access media devices'
      setError(errorMsg)
      throw err
    }
  }

  const createPeerConnection = (onIceCandidate: (candidate: RTCIceCandidate) => void) => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: ICE_SERVERS.iceServers,
      })

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          onIceCandidate(event.candidate)
        }
      }

      pc.ontrack = (event) => {
        remoteStreamRef.current = event.streams[0]
        setRemoteStream(event.streams[0])
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!)
        })
      }

      peerConnectionRef.current = pc
      return pc
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create peer connection'
      setError(errorMsg)
      throw err
    }
  }

  const createOffer = async () => {
    if (!peerConnectionRef.current) throw new Error('Peer connection not initialized')
    const offer = await peerConnectionRef.current.createOffer()
    await peerConnectionRef.current.setLocalDescription(offer)
    return offer
  }

  const createAnswer = async () => {
    if (!peerConnectionRef.current) throw new Error('Peer connection not initialized')
    const answer = await peerConnectionRef.current.createAnswer()
    await peerConnectionRef.current.setLocalDescription(answer)
    return answer
  }

  const setRemoteDescription = async (description: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) throw new Error('Peer connection not initialized')
    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(description))
  }

  const addIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (!peerConnectionRef.current) throw new Error('Peer connection not initialized')
    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate))
  }

  const toggleAudio = (enabled: boolean) => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = enabled
      })
    }
  }

  const toggleVideo = (enabled: boolean) => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = enabled
      })
    }
  }

  const cleanup = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
    }
    setLocalStream(null)
    setRemoteStream(null)
  }

  return {
    localStream,
    remoteStream,
    error,
    initializeLocalStream,
    createPeerConnection,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    toggleAudio,
    toggleVideo,
    cleanup,
  }
}
