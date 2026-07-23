export interface User {
  id: string;
  name: string;
  status: 'online' | 'calling' | 'offline';
  createdAt: number;
  lastSeen: number;
}

export type CallMode = 'video' | 'voice';
export type CallStatus = 'pending' | 'active' | 'ended' | 'rejected';

export interface Call {
  id: string;
  initiator: string;
  receiver: string;
  mode: CallMode;
  status: CallStatus;
  startTime?: number;
  endTime?: number;
  messages: Message[];
}

export interface Message {
  id: string;
  callId: string;
  sender: string;
  text: string;
  timestamp: number;
}

export interface SDPOffer {
  type: 'offer';
  sdp: string;
}

export interface SDPAnswer {
  type: 'answer';
  sdp: string;
}

export interface ICECandidate {
  candidate: string;
  sdpMLineIndex: number;
  sdpMid: string;
}
