import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Lock, LogOut, FileIcon, Mic, Square, Check, CheckCheck, Trash2, Reply, X, Phone, Video, PhoneOff } from 'lucide-react';
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
  
  const { messages, status, sendMessage, sendFile, disconnect, deleteMessage, isPeerTyping, sendTypingState, localStream, remoteStream, callStatus, startCall, answerCall, rejectCall, terminateCall } = useChat();
    const [replyingTo, setReplyingTo] = useState<any>(null);
    const typingTimeoutRef = useRef<any>(null);
  const navigate = useNavigate();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  return (
    <div className="fixed top-0 left-0 right-0 h-[100dvh] flex flex-col overflow-hidden max-w-5xl w-full mx-auto p-0 sm:p-4 md:p-6 pt-[72px] sm:pt-[104px] md:pt-[120px] bg-slate-50 dark:bg-slate-900 z-40" {...getRootProps({ onClick: e => e.stopPropagation() })}>
      <input {...getInputProps()} />
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 sm:border-x sm:border-t border-b sm:border-b-0 border-slate-200 dark:border-slate-700 sm:rounded-t-2xl p-3 sm:p-4 flex items-center justify-between z-10 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-300">
            <Lock size={18} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Anonymous Peer
            </h2>
            {status === 'connected' ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400"></span> Connected Securely
                <span className="text-slate-400 dark:text-slate-500 ml-2 font-mono">
                  {Math.floor(chatTimeLeft / 60)}:{(chatTimeLeft % 60).toString().padStart(2, '0')} remaining
                </span>
              </p>
            ) : (
              <p className="text-xs text-amber-500 flex items-center gap-1 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Reconnecting...
                <span className="text-slate-400 dark:text-slate-500 ml-2 font-mono">
                  {Math.floor(chatTimeLeft / 60)}:{(chatTimeLeft % 60).toString().padStart(2, '0')} remaining
                </span>
              </p>
            )}
          </div>
        </div>
                <div className="flex items-center gap-1 sm:gap-2">
          {callStatus === 'idle' && (
            <>
              <button onClick={() => startCall(false)} className="p-2 text-slate-500 hover:text-emerald-500 transition" title="Voice Call"><Phone size={20} /></button>
              <button onClick={() => startCall(true)} className="p-2 text-slate-500 hover:text-emerald-500 transition" title="Video Call"><Video size={20} /></button>
            </>
          )}
                    {callStatus === 'calling' && (
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 rounded-full px-2 py-1">
              <span className="text-xs font-bold text-amber-500 animate-pulse px-2">Calling...</span>
              <button type="button" onClick={terminateCall} className="p-1.5 bg-red-100 text-red-500 rounded-full hover:bg-red-200 transition" title="Cancel Call">
                <PhoneOff size={14} />
              </button>
            </div>
          )}
          <button 
            onClick={handleLeave}
          className="p-2 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
          title="Leave Chat"
        >
          <LogOut size={20} />
        </button>
        </div>
      </header>

            {callStatus === 'receiving' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 rounded-2xl p-4 z-50 flex flex-col items-center gap-4 w-[90%] max-w-sm">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center animate-bounce">
            <Phone size={24} />
          </div>
          <p className="font-bold text-slate-900 dark:text-white">Incoming Call...</p>
          <div className="flex gap-2 w-full">
            <button onClick={() => rejectCall()} className="flex-1 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition font-medium">Decline</button>
            <button onClick={() => answerCall(false)} className="flex-1 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition font-medium flex items-center justify-center gap-1"><Phone size={16} /> Audio</button>
            <button onClick={() => answerCall(true)} className="flex-1 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-medium flex items-center justify-center gap-1"><Video size={16} /> Video</button>
          </div>
        </div>
      )}

      {callStatus === 'connected' && (
        <div className="bg-slate-900 text-white p-2 flex items-center justify-center gap-4 shadow-inner relative h-[40vh] sm:h-96 shrink-0 overflow-hidden">
          <div className="relative h-full w-full max-w-2xl bg-black rounded-lg overflow-hidden border border-slate-700">
            <video 
              ref={(v) => { if (v) v.srcObject = remoteStream; }} 
              autoPlay playsInline className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-4 right-4 w-24 h-36 sm:w-32 sm:h-48 bg-black rounded-lg overflow-hidden border-2 border-slate-700 shadow-lg z-20">
            <video 
              ref={(v) => { if (v) v.srcObject = localStream; }} 
              autoPlay playsInline muted className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-4 right-4 z-30">
            <button onClick={terminateCall} className="p-3 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition animate-pulse">
              <PhoneOff size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 min-h-0 bg-slate-50 dark:bg-slate-900 sm:border-x border-slate-200 dark:border-slate-700 overflow-y-auto p-3 sm:p-4 flex flex-col gap-4 relative"
      >
        {isDragActive && (
          <div className="absolute inset-0 bg-emerald-500/10 border-2 border-emerald-500 border-dashed z-20 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl text-center shadow-lg mx-4">
              <Paperclip size={48} className="mx-auto text-emerald-500 dark:text-emerald-400 mb-4" />
              <p className="text-xl font-bold text-slate-900 dark:text-white">Drop files to send</p>
            </div>
          </div>
        )}
        
        <div className="text-center my-2 sm:my-4">
          <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs px-3 py-1 rounded-full">
            Room PIN: {pin} &bull; End-to-End Encrypted
          </span>
        </div>

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex flex-col max-w-[85%] md:max-w-[75%] ${msg.sender === 'me' ? 'self-end items-end' : 'self-start items-start'}`}
            >
                            <div 
                className={`p-3 rounded-2xl shadow-sm relative group ${
                  msg.sender === 'me' 
                    ? 'bg-emerald-500 text-white rounded-tr-sm' 
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-tl-sm'
                }`}
              >
                {msg.replyTo && (
                  <div className="mb-2 p-2 rounded bg-black/10 dark:bg-white/10 text-xs opacity-70 border-l-2 border-emerald-500">
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
                  <p className="break-words text-sm sm:text-base">{msg.content}</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {msg.fileType?.startsWith('image/') ? (
                        <img src={msg.content} alt={msg.fileName} className="max-w-full max-h-60 rounded-lg bg-black/5 object-contain" />
                      ) : msg.fileType?.startsWith('video/') ? (
                        <video controls playsInline preload="metadata" src={msg.content} className="max-w-full max-h-60 rounded-lg bg-black/10" />
                      ) : msg.fileType?.startsWith('audio/') ? (
                      <div className="flex flex-col gap-1 min-w-[200px]">
                        <audio controls src={msg.content} className="h-10 w-full" />
                      </div>
                    ) : (
                      <a href={msg.content} download={msg.fileName} className={`flex items-center gap-2 sm:gap-3 p-2 rounded-lg ${msg.sender === 'me' ? 'bg-emerald-600/50' : 'bg-slate-100 dark:bg-slate-700'} hover:opacity-80 transition`}>
                        <FileIcon size={20} className="shrink-0" />
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-medium text-sm truncate max-w-[120px] sm:max-w-[150px]">{msg.fileName}</span>
                          <span className="text-[10px] sm:text-xs opacity-70">
                            {msg.fileSize ? (msg.fileSize / 1024).toFixed(1) + ' KB' : 'File'}
                          </span>
                        </div>
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1 mx-1 text-slate-500">
                <span className="text-[10px]">{formatTime(msg.timestamp)}</span>
                {msg.sender === 'me' && (
                  <span className="flex items-center ml-1">
                    {msg.status === 'read' ? <CheckCheck size={14} className="text-blue-500" /> : <Check size={14} />}
                  </span>
                )}
                {msg.sender === 'peer' && !msg.isDeleted && (
                  <button type="button" onClick={(e) => { e.preventDefault(); setReplyingTo(msg); }} className="p-2 -m-2 ml-2 text-slate-400 hover:text-emerald-500 transition cursor-pointer" title="Reply">
                    <Reply size={14} />
                  </button>
                )}
                {msg.sender === 'me' && !msg.isDeleted && (
                  <button type="button" onClick={(e) => { e.preventDefault(); deleteMessage(msg.id); }} className="p-2 -m-2 ml-2 text-slate-400 hover:text-red-500 transition cursor-pointer" title="Delete for everyone">
                      <Trash2 size={16} />
                    </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
        {isPeerTyping && (
          <div className="text-xs text-slate-500 italic ml-4 flex items-center gap-2 mb-2">
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
        <div className="bg-slate-100 dark:bg-slate-800 p-2 text-xs flex justify-between items-center mx-4 -mb-2 rounded-t-lg z-10 relative shadow-sm border-t border-x border-slate-200 dark:border-slate-700">
          <span className="truncate opacity-70 border-l-2 border-emerald-500 pl-2">
            Replying to: {replyingTo.content || 'File'}
          </span>
          <button type="button" onClick={() => setReplyingTo(null)} className="p-1 hover:text-red-500"><X size={14} /></button>
        </div>
      )}
      <form onSubmit={handleSend} className="bg-white dark:bg-slate-800 border-t sm:border border-slate-200 dark:border-slate-700 sm:rounded-b-2xl p-2 sm:p-3 md:p-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:pb-3 md:pb-4 flex gap-2 items-end shadow-[0_-4px_10px_rgba(0,0,0,0.02)] dark:shadow-none shrink-0">
        
        {!isRecording && (
          <label className="p-2 md:p-3 text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 cursor-pointer transition flex-shrink-0">
            <input type="file" className="hidden" onClick={(e) => e.stopPropagation()} onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                sendFile(e.target.files[0]);
                e.target.value = '';
              }
            }} />
            <Paperclip size={24} />
          </label>
        )}
        
        {isRecording ? (
          <div className="flex-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/50 p-3 h-[46px] flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <Mic size={18} className="animate-bounce" />
              <span className="font-medium text-sm">Recording Audio...</span>
            </div>
            <span className="font-mono">{formatDuration(recordingTime)}</span>
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
            className="flex-1 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 p-3 max-h-32 min-h-[46px] resize-none focus:outline-none focus:border-emerald-500 transition placeholder-slate-400"
            rows={1}
          />
        )}
        
        {input.trim() ? (
          <button
            type="submit"
            className="p-3 bg-emerald-500 text-white dark:text-slate-900 rounded-xl hover:bg-emerald-600 dark:hover:bg-emerald-400 transition flex-shrink-0"
          >
            <Send size={20} />
          </button>
        ) : (
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-3 rounded-xl transition flex-shrink-0 text-white ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 dark:text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                : 'bg-emerald-500 hover:bg-emerald-600 dark:text-slate-900'
            }`}
          >
            {isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
          </button>
        )}
      </form>
    </div>
  );
};

export default ChatRoom;
