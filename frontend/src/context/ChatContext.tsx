import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { PeerManager } from '../utils/peerManager';

interface Message {
  id: string;
  sender: 'me' | 'peer';
  type: 'text' | 'file';
  content: string;
  timestamp: number;
  fileName?: string;
  fileType?: string;
  fileSize?: number;

  status?: 'sent' | 'read';
  isDeleted?: boolean;
  replyTo?: string;
}

interface ChatContextType {
  peerManager: PeerManager | null;
  status: 'disconnected' | 'connecting' | 'connected';
  messages: Message[];
  sendMessage: (text: string, replyTo?: string) => void;
  sendFile: (file: File) => void;
  initHost: () => Promise<string>;
  initGuest: (pin: string) => Promise<void>;
  disconnect: () => void;
  pin: string | null;

  deleteMessage: (messageId: string) => void;
    isPeerTyping: boolean;
  sendTypingState: (isTyping: boolean) => void;

  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callStatus: 'idle' | 'calling' | 'receiving' | 'connected';
  callType: 'audio' | 'video';
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isScreenSharing: boolean;
  canSwitchCamera: boolean;
  isMobileDevice: boolean;
  facingMode: 'user' | 'environment';
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => Promise<void>;
  switchCamera: () => Promise<void>;
  startCall: (video: boolean) => Promise<void>;
  answerCall: (video: boolean) => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  terminateCall: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const getSession = () => {
  try {
    const stored = sessionStorage.getItem('snaplinks_session');
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [peerManager, setPeerManager] = useState<PeerManager | null>(null);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>(() => {
    return getSession() ? 'connecting' : 'disconnected';
  });
  const [messages, setMessages] = useState<Message[]>(() => getSession()?.messages || []);
  const [pin, setPin] = useState<string | null>(() => getSession()?.pin || null);
  const [role, setRole] = useState<'host' | 'guest' | null>(() => getSession()?.role || null);

    const [isPeerTyping, setIsPeerTyping] = useState(false);

  const playPop = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch(e) {}
  };

  const managerRef = useRef<PeerManager | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'receiving' | 'connected'>('idle');
  const [callType, setCallType] = useState<'audio' | 'video'>('video');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const currentCallRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Check whether client is running on a real mobile device (phone / tablet)
  const isMobileDevice = typeof window !== 'undefined' && (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent || '') ||
    (('maxTouchPoints' in navigator) && navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent || ''))
  );

  // Laptops/Desktops NEVER have flip camera button (always false)
  // Mobile devices default to true unless device enumeration confirms single camera
  const [canSwitchCamera, setCanSwitchCamera] = useState<boolean>(() => {
    if (!isMobileDevice) return false;
    return true;
  });

  useEffect(() => {
    if (!isMobileDevice) {
      setCanSwitchCamera(false);
      return;
    }
    const checkCameras = async () => {
      try {
        if (navigator.mediaDevices?.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = devices.filter(d => d.kind === 'videoinput');
          // If 0 devices returned, permission not yet granted; allow switch button on mobile.
          // If >= 2 devices returned, multiple cameras confirmed.
          if (videoInputs.length >= 2 || videoInputs.length === 0) {
            setCanSwitchCamera(true);
          } else {
            setCanSwitchCamera(false);
          }
        }
      } catch {
        setCanSwitchCamera(true);
      }
    };
    checkCameras();
    navigator.mediaDevices?.addEventListener?.('devicechange', checkCameras);
    return () => {
      navigator.mediaDevices?.removeEventListener?.('devicechange', checkCameras);
    };
  }, [isMobileDevice]);

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoMuted(!videoTrack.enabled);
      }
    }
  };

  const switchCamera = async () => {
    if (!localStreamRef.current) return;
    try {
      const nextFacing = facingMode === 'user' ? 'environment' : 'user';

      // 1. Enumerate available video inputs to locate target deviceId if available
      let targetDeviceId: string | undefined;
      try {
        if (navigator.mediaDevices?.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = devices.filter(d => d.kind === 'videoinput');

          if (videoInputs.length > 1) {
            const currentTrack = localStreamRef.current.getVideoTracks()[0];
            const currentDeviceId = currentTrack?.getSettings?.().deviceId;

            if (nextFacing === 'environment') {
              // Search for back / rear / environment camera
              const backCam = videoInputs.find(d => {
                const label = (d.label || '').toLowerCase();
                return (label.includes('back') || label.includes('rear') || label.includes('environment')) && d.deviceId !== currentDeviceId;
              }) || videoInputs.find(d => d.deviceId !== currentDeviceId);
              if (backCam) targetDeviceId = backCam.deviceId;
            } else {
              // Search for front / user / selfie camera
              const frontCam = videoInputs.find(d => {
                const label = (d.label || '').toLowerCase();
                return (label.includes('front') || label.includes('user') || label.includes('selfie') || label.includes('facetime')) && d.deviceId !== currentDeviceId;
              }) || videoInputs.find(d => d.deviceId !== currentDeviceId);
              if (frontCam) targetDeviceId = frontCam.deviceId;
            }
          }
        }
      } catch (enumErr) {
        console.warn('Camera enumeration error during switch:', enumErr);
      }

      // 2. STOP and remove old video track BEFORE acquiring new camera!
      // This is crucial on mobile devices (Android/iOS) because the mobile camera hardware
      // locks the video pipeline and will reject or ignore new camera requests while the old track runs.
      const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
      if (oldVideoTrack) {
        localStreamRef.current.removeTrack(oldVideoTrack);
        oldVideoTrack.stop();
      }

      // 3. Acquire new camera stream with fallback ladder
      let newStream: MediaStream | null = null;

      // Attempt A: target deviceId exact
      if (targetDeviceId) {
        try {
          newStream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: targetDeviceId } },
            audio: false
          });
        } catch (e1) {
          console.warn('Switch failed with exact deviceId, trying exact facingMode:', e1);
        }
      }

      // Attempt B: exact facingMode
      if (!newStream) {
        try {
          newStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { exact: nextFacing } },
            audio: false
          });
        } catch (e2) {
          console.warn('Switch failed with exact facingMode, trying ideal facingMode:', e2);
        }
      }

      // Attempt C: ideal facingMode
      if (!newStream) {
        try {
          newStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: nextFacing },
            audio: false
          });
        } catch (e3) {
          console.warn('Switch failed with ideal facingMode, trying basic video:', e3);
        }
      }

      // Attempt D: fallback to any available video track
      if (!newStream) {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      const newVideoTrack = newStream.getVideoTracks()[0];
      if (!newVideoTrack) {
        throw new Error('No video track returned from camera switch');
      }

      // Respect current video muted state
      if (isVideoMuted) {
        newVideoTrack.enabled = false;
      }

      // Add new track to existing local stream
      localStreamRef.current.addTrack(newVideoTrack);

      // Replace video track in WebRTC peer connection sender
      if (currentCallRef.current?.peerConnection) {
        const senders = currentCallRef.current.peerConnection.getSenders() || [];
        const videoSender = senders.find((s: any) => s.track?.kind === 'video' || s.kind === 'video');
        if (videoSender) {
          await videoSender.replaceTrack(newVideoTrack);
        }
      }

      setFacingMode(nextFacing);
      setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
    } catch (err) {
      console.error('Switch camera error:', err);
      // Emergency recovery if camera stopped and failed to switch
      try {
        const recoveryStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        const recTrack = recoveryStream.getVideoTracks()[0];
        if (recTrack && localStreamRef.current) {
          localStreamRef.current.addTrack(recTrack);
          const senders = currentCallRef.current?.peerConnection?.getSenders() || [];
          const videoSender = senders.find((s: any) => s.track?.kind === 'video' || s.kind === 'video');
          if (videoSender) {
            await videoSender.replaceTrack(recTrack);
          }
          setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
        }
      } catch (recErr) {
        console.error('Failed to recover camera track:', recErr);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(t => t.stop());
          screenStreamRef.current = null;
        }
        const camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false });
        const camTrack = camStream.getVideoTracks()[0];
        if (localStreamRef.current) {
          const oldTrack = localStreamRef.current.getVideoTracks()[0];
          if (oldTrack) {
            localStreamRef.current.removeTrack(oldTrack);
            oldTrack.stop();
          }
          localStreamRef.current.addTrack(camTrack);
        }
        const sender = currentCallRef.current?.peerConnection?.getSenders()?.find((s: any) => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(camTrack);
        }
        setIsScreenSharing(false);
        setLocalStream(new MediaStream(localStreamRef.current ? localStreamRef.current.getTracks() : []));
      } else {
        if (!navigator.mediaDevices || typeof navigator.mediaDevices.getDisplayMedia !== 'function') {
          alert('Screen sharing is not supported by your mobile browser (such as iOS Safari). Mobile operating systems restrict web browsers from recording the screen for privacy. Please use a laptop or desktop computer to share your screen, or use Switch Camera.');
          return;
        }
        try {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
            video: true,
            audio: false 
          });
          screenStreamRef.current = screenStream;
          const screenTrack = screenStream.getVideoTracks()[0];
          screenTrack.onended = () => {
            toggleScreenShare();
          };
          if (localStreamRef.current) {
            const oldTrack = localStreamRef.current.getVideoTracks()[0];
            if (oldTrack) {
              localStreamRef.current.removeTrack(oldTrack);
              oldTrack.stop();
            }
            localStreamRef.current.addTrack(screenTrack);
          }
          const sender = currentCallRef.current?.peerConnection?.getSenders()?.find((s: any) => s.track?.kind === 'video');
          if (sender) {
            await sender.replaceTrack(screenTrack);
          }
          setIsScreenSharing(true);
          setLocalStream(new MediaStream(localStreamRef.current ? localStreamRef.current.getTracks() : []));
        } catch (err: any) {
          if (err.name === 'NotAllowedError') {
            console.log('Screen sharing request was cancelled by user');
          } else if (err.name === 'NotSupportedError') {
            alert('Screen sharing is not supported on this mobile device.');
          } else {
            console.warn('Screen share error:', err);
            alert('Screen share error: ' + (err.message || 'Permission denied or not supported on this browser.'));
          }
        }
      }
    } catch (err: any) {
      console.warn('Screen share toggle error:', err);
    }
  };

  const endCall = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }
    setIsScreenSharing(false);
    setIsAudioMuted(false);
    setIsVideoMuted(false);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setCallStatus('idle');
    setIncomingCall(null);
    setFacingMode('user');
    if (currentCallRef.current) {
      currentCallRef.current.close();
      currentCallRef.current = null;
    }
  };

  const startCall = async (video: boolean) => {
    setCallType(video ? 'video' : 'audio');
    setIsAudioMuted(false);
    setIsVideoMuted(false);
    setIsScreenSharing(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: video ? { facingMode: 'user' } : false, audio: true });
      localStreamRef.current = stream;
      setLocalStream(stream);
      setCallStatus('calling');
      if (managerRef.current) {
        const call = managerRef.current.startMediaCall(stream);
        currentCallRef.current = call;
        if (call) {
          call.on('stream', (remote: MediaStream) => {
            setRemoteStream(remote);
            setCallStatus('connected');
          });
          call.on('close', endCall);
        }
      }
    } catch(e: any) {
      console.error(e);
      alert('Call failed: ' + (e.message || 'Camera/Microphone access blocked. Note: Browsers block media access on HTTP networks unless using localhost.'));
      setCallStatus('idle');
    }
  };

  const answerCall = async (video: boolean) => {
    setCallType(video ? 'video' : 'audio');
    setIsAudioMuted(false);
    setIsVideoMuted(false);
    setIsScreenSharing(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: video ? { facingMode: 'user' } : false, audio: true });
      localStreamRef.current = stream;
      setLocalStream(stream);
      if (incomingCall) {
        incomingCall.answer(stream);
        currentCallRef.current = incomingCall;
        incomingCall.on('stream', (remote: MediaStream) => {
          setRemoteStream(remote);
          setCallStatus('connected');
        });
      }
    } catch(e: any) {
      console.error(e);
      alert('Answer failed: ' + (e.message || 'Camera/Microphone access blocked.'));
      rejectCall();
    }
  };

  const rejectCall = () => {
    managerRef.current?.sendMessage({ type: 'call-ended' });
    if (incomingCall) incomingCall.close();
    setIncomingCall(null);
    setCallStatus('idle');
  };

  const terminateCall = () => {
    managerRef.current?.sendMessage({ type: 'call-ended' });
    endCall();
  };


  // Sync to session storage
  useEffect(() => {
    if (pin && role) {
      sessionStorage.setItem('snaplinks_session', JSON.stringify({ pin, role, messages }));
    } else {
      sessionStorage.removeItem('snaplinks_session');
    }
  }, [pin, role, messages]);

  const initManager = () => {
    const handleStatus = (newStatus: 'disconnected' | 'connecting' | 'connected') => {
      setStatus(newStatus);
      if (newStatus === 'disconnected') {
        sessionStorage.removeItem('snaplinks_session');
        sessionStorage.removeItem('snaplinks_timer');
      }
    };
    
          const handleMessage = (data: any) => {
        if (data.type === 'call-ended') {
          endCall();
          return;
        }
        if (data.type === 'typing') {
        setIsPeerTyping(data.isTyping);
        return;
      }
      if (data.type === 'ack') {
        setMessages(prev => prev.map(m => m.id === data.messageId ? { ...m, status: 'read' } : m));
        return;
      }
      if (data.type === 'delete') {
        setMessages(prev => prev.map(m => m.id === data.messageId ? { ...m, isDeleted: true } : m));
        return;
      }
      if (data.type === 'text') {
        playPop();
        setMessages(prev => [...prev, { ...data, sender: 'peer' }]);
        managerRef.current?.sendMessage({ type: 'ack', messageId: data.id });
      } else if (data.type === 'file') {
        playPop();
        const blob = new Blob([data.content], { type: data.fileType });
        const url = URL.createObjectURL(blob);
        setMessages(prev => [...prev, { ...data, sender: 'peer', content: url }]);
        managerRef.current?.sendMessage({ type: 'ack', messageId: data.id });
      }
    };

        const handleCall = (call: any) => {
      setIncomingCall(call);
      setCallStatus('receiving');
      currentCallRef.current = call;
      call.on('close', endCall);
    };

    const manager = new PeerManager(handleStatus, handleMessage, handleCall);
    setPeerManager(manager);
    managerRef.current = manager;
    return manager;
  };

  // Restore session on mount
  useEffect(() => {
    const manager = initManager();
    const session = getSession();
    if (session && session.pin && session.role) {
      if (session.role === 'host') {
        manager.createRoom(session.pin).catch(() => {
          disconnect();
        });
      } else {
        manager.joinRoom(session.pin).catch(() => {
          disconnect();
        });
      }
    }
    return () => {
      manager.disconnect();
    };
  }, []);

  const initHost = async () => {
    if (!managerRef.current) return '';
    try {
      setMessages([]);
      setRole('host');
      const generatedPin = await managerRef.current.createRoom();
      setPin(generatedPin);
      return generatedPin;
    } catch (e) {
      setRole(null);
      throw e;
    }
  };

  const initGuest = async (roomPin: string) => {
    if (!managerRef.current) return;
    try {
      setMessages([]);
      setRole('guest');
      setPin(roomPin);
      await managerRef.current.joinRoom(roomPin);
    } catch (e) {
      setPin(null);
      setRole(null);
      throw e;
    }
  };

  const sendMessage = (text: string, replyTo?: string) => {
    if (!managerRef.current) return;
    const msg = {
      id: Date.now().toString(),
      type: 'text',
      content: text,
      timestamp: Date.now(),
      replyTo
    };
    managerRef.current.sendMessage(msg);
    setMessages(prev => [...prev, { ...msg, sender: 'me', status: 'sent' } as Message]);
  };

    const sendTypingState = (isTyping: boolean) => {
    if (!managerRef.current) return;
    managerRef.current.sendMessage({ type: 'typing', isTyping });
  };

  const sendFile = (file: File) => {
    if (!managerRef.current) return;
    if (!file.type.startsWith('image/') && file.size > 50 * 1024 * 1024) {
      alert('File is too large for P2P transfer (max 50MB).');
      return;
    }
    const processAndSend = (buffer: ArrayBuffer, fileName: string, fileType: string, fileSize: number) => {
      const msg = {
        id: Date.now().toString(),
        type: 'file',
        content: buffer,
        fileName,
        fileType,
        fileSize,
        timestamp: Date.now()
      };
      managerRef.current?.sendMessage(msg);
      const blob = new Blob([buffer], { type: fileType });
      const url = URL.createObjectURL(blob);
      setMessages(prev => [...prev, { ...msg, content: url, sender: 'me', status: 'sent' } as Message]);
    };
    if (file.type.startsWith('image/')) {
      const img = new Image();
      const objUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objUrl);
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX = 1280;
        if (width > height && width > MAX) {
          height *= MAX / width;
          width = MAX;
        } else if (height > MAX) {
          width *= MAX / height;
          height = MAX;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (!blob) return;
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              processAndSend(e.target.result as ArrayBuffer, file.name, blob.type, blob.size);
            }
          };
          reader.readAsArrayBuffer(blob);
        }, 'image/jpeg', 0.8);
      };
      img.src = objUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          processAndSend(e.target.result as ArrayBuffer, file.name, file.type, file.size);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

    const deleteMessage = (messageId: string) => {
    if (!managerRef.current) return;
    managerRef.current.sendMessage({ type: 'delete', messageId });
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isDeleted: true } : m));
  };
  
  const disconnect = () => {
    messages.forEach(msg => {
      if (msg.type === 'file' && typeof msg.content === 'string' && msg.content.startsWith('blob:')) {
        URL.revokeObjectURL(msg.content);
      }
    });
    if (managerRef.current) {
      managerRef.current.disconnect();
    }
    sessionStorage.removeItem('snaplinks_session');
    sessionStorage.removeItem('snaplinks_timer');
    setStatus('disconnected');
    setMessages([]);
    setPin(null);
    setRole(null);
    initManager();
  };

  return (
    <ChatContext.Provider value={{
      peerManager, status, messages, sendMessage, sendFile, deleteMessage,
      initHost, initGuest, disconnect, pin, isPeerTyping, sendTypingState,
      localStream, remoteStream, callStatus, callType,
      isAudioMuted, isVideoMuted, isScreenSharing,
      canSwitchCamera, isMobileDevice, facingMode,
      toggleAudio, toggleVideo, toggleScreenShare, switchCamera,
      startCall, answerCall, rejectCall, endCall, terminateCall
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
