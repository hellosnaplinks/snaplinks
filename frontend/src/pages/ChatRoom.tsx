import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Paperclip, Lock, LogOut, FileIcon, Mic, MicOff, Square, 
  Check, CheckCheck, Trash2, Reply, X, Phone, Video, VideoOff, 
  PhoneOff, Monitor, MessageSquare, RefreshCw, Maximize2, Minimize2 
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useDropzone } from 'react-dropzone';

const ChatRoom = () => {
  const { pin } = useParams<{ pin: string }>();
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [chatTimeLeft, setChatTimeLeft] = useState(() => {
    const saved = sessionStorage.getItem('snaplinks_timer');
    return saved ? parseInt(saved, 10) : 3600;
  }); // 1 hour

  useEffect(() => {
    sessionStorage.setItem('snaplinks_timer', chatTimeLeft.toString());
  }, [chatTimeLeft]);
  
  const { 
    messages, status, sendMessage, sendFile, disconnect, deleteMessage, 
    isPeerTyping, sendTypingState, localStream, remoteStream, callStatus, callType,
    isAudioMuted, isVideoMuted, isScreenSharing,
    toggleAudio, toggleVideo, toggleScreenShare, switchCamera,
    startCall, answerCall, rejectCall, terminateCall 
  } = useChat();

  const [replyingTo, setReplyingTo] = useState<any>(null);
  const typingTimeoutRef = useRef<any>(null);
  const navigate = useNavigate();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  const [showMobileChat, setShowMobileChat] = useState(false);
  const [videoFit, setVideoFit] = useState<'contain' | 'cover'>('contain');
  const [wasConnected, setWasConnected] = useState(false);

  useEffect(() => {
    if (status === 'connected') {
      setWasConnected(true);
    }
  }, [status]);

  useEffect(() => {
    if (status === 'disconnected') {
      if (wasConnected) {
        alert("The other peer has left the chat. The secure session is now closed.");
      }
      navigate('/');
    }
  }, [status, navigate, wasConnected]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  // Connect video and audio streams
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(e => console.warn('Remote video play error:', e));
    }
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch(e => console.warn('Remote audio play error:', e));
    }
  }, [remoteStream, callStatus]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(e => console.warn('Local video play error:', e));
    }
  }, [localStream, callStatus]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      acceptedFiles.forEach((file) => sendFile(file));
    }
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input.trim(), replyingTo?.id);
      setInput('');
      setReplyingTo(null);
      sendTypingState(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `AudioMessage_${Date.now()}.webm`, { type: 'audio/webm' });
        sendFile(audioFile);
        stream.getTracks().forEach(track => track.stop());
        setRecordingTime(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleLeave = () => {
    setWasConnected(false);
    disconnect();
    navigate('/');
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setChatTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("Room has expired after 1 hour.");
          setWasConnected(false);
          disconnect();
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [disconnect, navigate]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const isVideoCallActive = (callStatus === 'connected' || callStatus === 'calling') && callType === 'video';

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 pt-16 sm:pt-20 md:pt-24 pb-2 sm:pb-3 px-2 sm:px-4 md:px-6 bg-slate-100 dark:bg-[#0a0f1d] z-40 flex flex-col overflow-hidden" {...getRootProps({ onClick: e => e.stopPropagation() })}>
      <input {...getInputProps()} />

      {/* Hidden background audio for remote stream */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* INCOMING CALL MODAL */}
      <AnimatePresence>
        {callStatus === 'receiving' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl p-6 flex flex-col items-center gap-5 w-full max-w-sm text-center">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner animate-bounce">
                <Phone size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Incoming Call...</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Anonymous Peer is calling you securely</p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button 
                  type="button"
                  onClick={() => rejectCall()} 
                  className="flex-1 py-3 bg-red-100 hover:bg-red-200 dark:bg-red-500/20 dark:hover:bg-red-500/30 text-red-600 dark:text-red-400 rounded-xl transition font-medium text-sm flex items-center justify-center gap-1.5"
                >
                  <PhoneOff size={16} /> Decline
                </button>
                <button 
                  type="button"
                  onClick={() => answerCall(false)} 
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl transition font-medium text-sm flex items-center justify-center gap-1.5"
                >
                  <Phone size={16} /> Audio
                </button>
                <button 
                  type="button"
                  onClick={() => answerCall(true)} 
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-xl transition font-semibold text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/30"
                >
                  <Video size={16} /> Video
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AUDIO CALL ACTIVE BANNER */}
      {callStatus === 'connected' && callType === 'audio' && (
        <div className="w-full max-w-4xl mx-auto mb-2 bg-slate-900 text-white rounded-2xl p-2.5 px-4 flex items-center justify-between shadow-lg border border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-pulse">
              <Phone size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Encrypted Audio Call in Progress</p>
              <p className="text-[10px] text-emerald-400">Connected</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleAudio}
              className={`p-2 rounded-xl transition ${isAudioMuted ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-white'}`}
            >
              {isAudioMuted ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <button
              type="button"
              onClick={terminateCall}
              className="p-2 px-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition text-xs font-semibold flex items-center gap-1"
            >
              <PhoneOff size={16} /> End
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER: Split view if Video Call is active, otherwise centered chat */}
      <div className={`w-full flex-1 min-h-0 h-full mx-auto ${
        isVideoCallActive 
          ? 'max-w-[1680px] flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-6' 
          : 'max-w-4xl flex flex-col'
      }`}>
        
        {/* ======================================================== */}
        {/* LEFT PANE: VIDEO CALL WINDOW (EXACT UI FROM SCREENSHOT)  */}
        {/* ======================================================== */}
        {isVideoCallActive && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 w-full h-full min-w-0 min-h-0 bg-slate-950 border border-slate-800/80 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col justify-between"
          >
            {/* Main Remote Video (Peer) */}
            <div className="absolute inset-0 w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden">
              <video 
                ref={(el) => {
                  remoteVideoRef.current = el;
                  if (el && remoteStream && el.srcObject !== remoteStream) {
                    el.srcObject = remoteStream;
                    el.play().catch(() => {});
                  }
                }}
                autoPlay 
                playsInline 
                className={`w-full h-full ${videoFit === 'contain' ? 'object-contain' : 'object-cover'} transition-all duration-200`}
              />

              {/* Fallback / Connecting State */}
              {(!remoteStream || callStatus === 'calling') && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center p-6 bg-slate-950/90 z-10">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-900 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-2xl animate-pulse">
                    <Video size={32} />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-bold text-white">
                      {callStatus === 'calling' ? 'Calling Anonymous Peer...' : 'Connecting Video Feed...'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">End-to-End Encrypted WebRTC Tunnel</p>
                  </div>
                </div>
              )}
            </div>

            {/* TOP-LEFT OVERLAY: Anonymous Peer & Status */}
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20 flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-lg">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-800/90 flex items-center justify-center text-slate-300">
                <Lock size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-white text-xs sm:text-sm font-semibold leading-tight">Anonymous Peer</span>
                <span className="text-[10px] sm:text-xs text-emerald-400 font-medium flex items-center gap-1.5 leading-tight">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Connected Securely
                </span>
              </div>
            </div>

            {/* TOP-RIGHT/CENTER OVERLAY: Room PIN & Encryption + Full View (Fit Screen) Toggle */}
            <div className="absolute top-3 sm:top-4 right-3 md:right-auto md:left-1/2 md:-translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-full text-[10px] sm:text-xs font-medium text-slate-300 shadow-lg">
                <span>PIN: <strong className="font-mono text-emerald-400">{pin}</strong></span>
                <span className="hidden sm:inline text-slate-500">&bull;</span>
                <span className="hidden sm:inline">Encrypted</span>
              </div>
              <button
                type="button"
                onClick={() => setVideoFit(prev => prev === 'contain' ? 'cover' : 'contain')}
                title={videoFit === 'contain' ? "Zoom to Fill Screen" : "Fit Full Screen (Show Entire Screen / No Crop)"}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-700/60 rounded-full text-[10px] sm:text-xs font-medium text-slate-300 shadow-lg transition active:scale-95 cursor-pointer"
              >
                {videoFit === 'contain' ? <Maximize2 size={12} className="text-emerald-400" /> : <Minimize2 size={12} />}
                <span>{videoFit === 'contain' ? 'Full View' : 'Fill'}</span>
              </button>
            </div>

            {/* BOTTOM-RIGHT OVERLAY: WhatsApp Style Inset Self Video ("My Side Video") */}
            <div 
              style={{
                position: 'absolute',
                zIndex: 35,
              }}
              className="bottom-20 right-3 sm:bottom-24 sm:right-4 lg:bottom-6 lg:right-6 w-24 sm:w-28 md:w-36 lg:w-44 aspect-[9/16] rounded-2xl overflow-hidden border-2 border-slate-700/80 shadow-2xl bg-slate-950 group transition-all"
            >
              <video 
                ref={(el) => {
                  localVideoRef.current = el;
                  if (el && localStream && el.srcObject !== localStream) {
                    el.srcObject = localStream;
                    el.play().catch(() => {});
                  }
                }}
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover ${!isScreenSharing ? '-scale-x-100' : ''}`}
              />
              {isVideoMuted && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
                  <VideoOff size={18} />
                  <span className="text-[9px]">Camera Off</span>
                </div>
              )}
              <div className="absolute bottom-1 right-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[9px] text-slate-200 font-medium tracking-wide">
                You {isAudioMuted ? '(Muted)' : ''}
              </div>
            </div>

            {/* BOTTOM-CENTER OVERLAY: Floating Call Controls Dock */}
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-900/90 backdrop-blur-xl border border-slate-700/70 rounded-2xl shadow-2xl max-w-[95%]">
              {/* Mute Mic */}
              <button
                type="button"
                onClick={toggleAudio}
                title={isAudioMuted ? "Unmute Microphone" : "Mute Microphone"}
                className={`p-2.5 sm:p-3 rounded-xl transition ${
                  isAudioMuted 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' 
                    : 'bg-slate-800/90 hover:bg-slate-700 text-white'
                }`}
              >
                {isAudioMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              {/* Toggle Camera */}
              <button
                type="button"
                onClick={toggleVideo}
                title={isVideoMuted ? "Turn Camera On" : "Turn Camera Off"}
                className={`p-2.5 sm:p-3 rounded-xl transition ${
                  isVideoMuted 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' 
                    : 'bg-slate-800/90 hover:bg-slate-700 text-white'
                }`}
              >
                {isVideoMuted ? <VideoOff size={18} /> : <Video size={18} />}
              </button>

              {/* Switch / Flip Camera (MOBILE ONLY - hidden on laptop/desktop) */}
              <button
                type="button"
                onClick={switchCamera}
                title="Switch Camera (Front / Back)"
                className="flex md:hidden p-2.5 sm:p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white transition active:scale-95 items-center justify-center"
              >
                <RefreshCw size={18} />
              </button>

              {/* Screen Share / Switch Display (Desktop / Laptop only - hidden on mobile) */}
              <button
                type="button"
                onClick={toggleScreenShare}
                title={isScreenSharing ? "Stop Sharing Screen" : "Share Screen"}
                className={`hidden md:flex p-2.5 sm:p-3 rounded-xl transition ${
                  isScreenSharing 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                    : 'bg-slate-800/90 hover:bg-slate-700 text-white'
                }`}
              >
                <Monitor size={18} />
              </button>

              {/* Open Mobile Chat Drawer */}
              <button
                type="button"
                onClick={() => setShowMobileChat(true)}
                title="Open Chat"
                className="flex lg:hidden p-2.5 sm:p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white transition relative active:scale-95"
              >
                <MessageSquare size={18} />
                {messages.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                    {messages.length > 9 ? '9+' : messages.length}
                  </span>
                )}
              </button>

              {/* End Call */}
              <button
                type="button"
                onClick={terminateCall}
                title="End Call"
                className="p-2.5 sm:p-3 px-4 sm:px-5 bg-red-500 hover:bg-red-600 active:scale-95 text-white rounded-xl shadow-lg shadow-red-500/40 transition flex items-center justify-center gap-1.5"
              >
                <PhoneOff size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* RIGHT PANE: CHAT WINDOW                                  */}
        {/* ======================================================== */}
        <div className={`flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative ${
          isVideoCallActive 
            ? `${showMobileChat ? 'fixed inset-x-2 inset-y-16 sm:inset-x-4 sm:inset-y-20 z-50 flex' : 'hidden'} lg:flex lg:static lg:inset-auto lg:w-[420px] xl:w-[480px] lg:h-full lg:shrink-0` 
            : 'w-full h-full'
        }`}>

          {/* Mobile In-Call Banner when Chat is Open */}
          {isVideoCallActive && (
            <div className="flex lg:hidden items-center justify-between px-4 py-2.5 bg-emerald-600 text-white shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-xs font-semibold">Video Call in Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleAudio}
                  className={`p-1.5 rounded-lg text-xs font-medium ${isAudioMuted ? 'bg-red-500 text-white' : 'bg-emerald-700 hover:bg-emerald-800 text-white'}`}
                  title="Mute / Unmute Mic"
                >
                  {isAudioMuted ? <MicOff size={14} /> : <Mic size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMobileChat(false)}
                  className="px-3 py-1 bg-white text-emerald-700 hover:bg-slate-100 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
                >
                  <Video size={13} /> Back to Video
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <header className="p-3 sm:p-4 bg-white dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-300 shadow-inner">
                <Lock size={18} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-tight">
                  Anonymous Peer
                </h2>
                {status === 'connected' ? (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 leading-tight mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Connected Securely
                    <span className="text-slate-400 dark:text-slate-500 ml-1.5 font-mono">
                      {Math.floor(chatTimeLeft / 60)}:{(chatTimeLeft % 60).toString().padStart(2, '0')} remaining
                    </span>
                  </p>
                ) : (
                  <p className="text-[11px] text-amber-500 flex items-center gap-1.5 leading-tight mt-0.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Reconnecting...
                    <span className="text-slate-400 dark:text-slate-500 ml-1.5 font-mono">
                      {Math.floor(chatTimeLeft / 60)}:{(chatTimeLeft % 60).toString().padStart(2, '0')} remaining
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {callStatus === 'idle' && (
                <>
                  <button 
                    onClick={() => startCall(false)} 
                    className="p-2 text-slate-500 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition" 
                    title="Voice Call"
                  >
                    <Phone size={20} />
                  </button>
                  <button 
                    onClick={() => startCall(true)} 
                    className="p-2 text-slate-500 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition" 
                    title="Video Call"
                  >
                    <Video size={20} />
                  </button>
                </>
              )}
              {callStatus === 'calling' && !isVideoCallActive && (
                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 rounded-full px-2 py-1">
                  <span className="text-xs font-bold text-amber-500 animate-pulse px-2">Calling...</span>
                  <button type="button" onClick={terminateCall} className="p-1.5 bg-red-100 text-red-500 rounded-full hover:bg-red-200 transition" title="Cancel Call">
                    <PhoneOff size={14} />
                  </button>
                </div>
              )}
              <button 
                onClick={handleLeave}
                className="p-2 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                title="Leave Chat"
              >
                <LogOut size={20} />
              </button>
            </div>
          </header>

          {/* Messages Feed */}
          <div 
            ref={chatContainerRef}
            className="flex-1 min-h-0 bg-slate-50 dark:bg-[#0c152e] overflow-y-auto p-3 sm:p-4 flex flex-col gap-3 relative"
          >
            {isDragActive && (
              <div className="absolute inset-0 bg-emerald-500/10 border-2 border-emerald-500 border-dashed z-20 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl text-center shadow-lg mx-4">
                  <Paperclip size={44} className="mx-auto text-emerald-500 mb-3" />
                  <p className="text-lg font-bold text-slate-900 dark:text-white">Drop files to send securely</p>
                </div>
              </div>
            )}
            
            {!isVideoCallActive && (
              <div className="text-center my-2">
                <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs px-3 py-1 rounded-full">
                  Room PIN: {pin} &bull; End-to-End Encrypted
                </span>
              </div>
            )}

            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex flex-col max-w-[85%] md:max-w-[78%] ${msg.sender === 'me' ? 'self-end items-end' : 'self-start items-start'}`}
                >
                  <div 
                    className={`p-3 rounded-2xl shadow-sm relative group ${
                      msg.sender === 'me' 
                        ? 'bg-emerald-600 text-white rounded-tr-xs' 
                        : 'bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-tl-xs'
                    }`}
                  >
                    {msg.replyTo && (
                      <div className="mb-2 p-2 rounded-lg bg-black/10 dark:bg-white/10 text-xs opacity-75 border-l-2 border-emerald-400">
                        <p className="line-clamp-1 truncate overflow-hidden max-w-[200px]">
                          {messages.find(m => m.id === msg.replyTo)?.content || 'File / Deleted message'}
                        </p>
                      </div>
                    )}
                    {msg.isDeleted ? (
                      <p className="italic text-sm opacity-70 flex items-center gap-2">
                        <Trash2 size={14} /> This message was deleted
                      </p>
                    ) : msg.type === 'text' ? (
                      <p className="break-words text-sm sm:text-base leading-relaxed">{msg.content}</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {msg.fileType?.startsWith('image/') ? (
                          <img src={msg.content} alt={msg.fileName} className="max-w-full max-h-60 rounded-xl bg-black/5 object-contain" />
                        ) : msg.fileType?.startsWith('video/') ? (
                          <video controls playsInline preload="metadata" src={msg.content} className="max-w-full max-h-60 rounded-xl bg-black/10" />
                        ) : msg.fileType?.startsWith('audio/') ? (
                          <div className="flex flex-col gap-1 min-w-[200px]">
                            <audio controls src={msg.content} className="h-10 w-full" />
                          </div>
                        ) : (
                          <a 
                            href={msg.content} 
                            download={msg.fileName} 
                            className={`flex items-center gap-3 p-2.5 rounded-xl ${
                              msg.sender === 'me' ? 'bg-emerald-700/60 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                            } hover:opacity-90 transition`}
                          >
                            <div className="w-9 h-9 rounded-lg bg-amber-400/20 text-amber-500 flex items-center justify-center shrink-0">
                              <FileIcon size={20} />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <span className="font-semibold text-xs sm:text-sm truncate max-w-[140px] sm:max-w-[180px]">{msg.fileName}</span>
                              <span className="text-[10px] sm:text-xs opacity-70">
                                {msg.fileSize ? (msg.fileSize / (1024 * 1024)).toFixed(1) + ' MB' : 'File'} &bull; Direct Transfer
                              </span>
                            </div>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1 mx-1 text-slate-400 text-[10px]">
                    <span>{formatTime(msg.timestamp)}</span>
                    {msg.sender === 'me' && (
                      <span className="flex items-center ml-1">
                        {msg.status === 'read' ? <CheckCheck size={14} className="text-blue-400" /> : <Check size={14} />}
                      </span>
                    )}
                    {msg.sender === 'peer' && !msg.isDeleted && (
                      <button type="button" onClick={(e) => { e.preventDefault(); setReplyingTo(msg); }} className="p-1 text-slate-400 hover:text-emerald-500 transition ml-1" title="Reply">
                        <Reply size={13} />
                      </button>
                    )}
                    {msg.sender === 'me' && !msg.isDeleted && (
                      <button type="button" onClick={(e) => { e.preventDefault(); deleteMessage(msg.id); }} className="p-1 text-slate-400 hover:text-red-500 transition ml-1" title="Delete for everyone">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
            
            {isPeerTyping && (
              <div className="text-xs text-slate-400 italic ml-2 flex items-center gap-2 mb-1">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
                Peer is typing...
              </div>
            )}
          </div>

          {/* Input Area */}
          {replyingTo && (
            <div className="bg-slate-100 dark:bg-slate-800 p-2 text-xs flex justify-between items-center mx-3 -mb-1 rounded-t-xl z-10 relative shadow-sm border-t border-x border-slate-200 dark:border-slate-700">
              <span className="truncate opacity-75 border-l-2 border-emerald-500 pl-2">
                Replying to: {replyingTo.content || 'File'}
              </span>
              <button type="button" onClick={() => setReplyingTo(null)} className="p-1 hover:text-red-500"><X size={14} /></button>
            </div>
          )}

          <form onSubmit={handleSend} className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-2 sm:p-3 flex gap-2 items-end shadow-sm shrink-0">
            {!isRecording && (
              <label className="p-2.5 text-slate-400 hover:text-emerald-500 transition cursor-pointer shrink-0">
                <input type="file" className="hidden" onClick={(e) => e.stopPropagation()} onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    sendFile(e.target.files[0]);
                    e.target.value = '';
                  }
                }} />
                <Paperclip size={22} />
              </label>
            )}

            {isRecording ? (
              <div className="flex-1 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/50 p-2.5 h-[44px] flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-2">
                  <Mic size={18} className="animate-bounce" />
                  <span className="font-semibold text-xs sm:text-sm">Recording Voice Note...</span>
                </div>
                <span className="font-mono text-xs">{formatDuration(recordingTime)}</span>
              </div>
            ) : (
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  sendTypingState(true);
                  if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                  typingTimeoutRef.current = setTimeout(() => sendTypingState(false), 2000);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder="Type a secure message..."
                className="flex-1 bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700/80 p-2.5 px-3 max-h-32 min-h-[44px] resize-none focus:outline-none focus:border-emerald-500 transition placeholder-slate-400 text-sm leading-relaxed"
                rows={1}
              />
            )}

            {input.trim() ? (
              <button
                type="submit"
                className="p-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-xl transition shrink-0 shadow-md shadow-emerald-500/20"
              >
                <Send size={19} />
              </button>
            ) : (
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-2.5 rounded-xl transition shrink-0 text-white ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/40 animate-pulse' 
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                }`}
              >
                {isRecording ? <Square size={19} fill="currentColor" /> : <Mic size={19} />}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
