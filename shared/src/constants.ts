export const CALL_CONFIG = {
  DEFAULT_MODE: 'video' as const,
  TIMEOUT: 30000,
  MAX_CALLS_PER_HOUR: 10,
  SESSION_TIMEOUT: 30 * 60 * 1000,
  INACTIVITY_TIMEOUT: 5 * 60 * 1000,
};

export const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const WEBRTC_CONFIG = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'user',
  },
};

export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  USER_JOIN: 'user:join',
  USER_LEAVE: 'user:leave',
  USERS_AVAILABLE: 'users:available',
  CALL_REQUEST: 'call:request',
  CALL_ACCEPT: 'call:accept',
  CALL_REJECT: 'call:reject',
  CALL_END: 'call:end',
  SIGNAL_OFFER: 'signal:offer',
  SIGNAL_ANSWER: 'signal:answer',
  SIGNAL_ICE: 'signal:ice',
  MESSAGE_SEND: 'message:send',
  MESSAGE_RECEIVE: 'message:receive',
  ERROR: 'error:general',
};
