import { WEBRTC_CONFIG, ICE_SERVERS } from '@ari/shared'

class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null

  async initializeLocalStream(audio = true, video = true): Promise<MediaStream> {
    try {
      const constraints = {
        audio: audio ? WEBRTC_CONFIG.audio : false,
        video: video ? WEBRTC_CONFIG.video : false,
      }
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
      return this.localStream
    } catch (error) {
      console.error('Error initializing local stream:', error)
      throw error
    }
  }

  createPeerConnection(): RTCPeerConnection {
    this.peerConnection = new RTCPeerConnection({
      iceServers: ICE_SERVERS.iceServers,
    })
    return this.peerConnection
  }

  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  closeConnection(): void {
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
      this.localStream = null
    }
  }
}

export default new WebRTCService()
