import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, MessageSquare, Loader2, Share2, ShieldAlert, ArrowLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useChat } from '../context/ChatContext';

const CreateRoom = () => {
  const [loading, setLoading] = useState(false);
  const [createdPin, setCreatedPin] = useState<string | null>(null);
  const [copiedPin, setCopiedPin] = useState(false);

  const [roomTimeLeft, setRoomTimeLeft] = useState(180);
  
  const { initHost, status } = useChat();
  const navigate = useNavigate();

  useEffect(() => {
    if (!createdPin || status === 'connected') return;
    
    const timer = setInterval(() => {
      setRoomTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [createdPin, status]);

  useEffect(() => {
    if (roomTimeLeft === 0 && status !== 'connected') {
      alert("Room expired because no one joined within 3 minutes.");
      window.location.reload();
    }
  }, [roomTimeLeft, status]);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const pin = await initHost();
      setCreatedPin(pin);
    } catch (err) {
      console.error(err);
      alert('Failed to create room.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (createdPin) {
      navigator.clipboard.writeText(createdPin);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    }
  };

  const copyLink = () => {
    if (createdPin) {
      const url = `${window.location.origin}/join/${createdPin}`;
      navigator.clipboard.writeText(url);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    }
  };

  const shareNativeLink = async () => {
    if (createdPin && navigator.share) {
      const url = `${window.location.origin}/join/${createdPin}`;
      try {
        await navigator.share({
          title: 'SnapLinks Secure Room',
          text: 'Join my secure room on SnapLinks',
          url: url
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      copyLink(); // fallback
    }
  };

  if (status === 'connected') {
    navigate(`/chat/${createdPin}`);
  }

  return (
    <div className="flex-1 w-full max-w-[100rem] mx-auto px-4 sm:px-6 md:px-8 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] py-8 relative">
      
      <div className="w-full max-w-md mb-4 sm:mb-8 flex justify-start">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={18} /> Back
        </button>
      </div>

      {/* MAIN APP CONTENT */}
      <div className="w-full flex justify-center">
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          className={`w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col ${createdPin ? 'max-w-4xl' : 'max-w-md'}`}
        >
          <AnimatePresence mode="wait">
            {!createdPin ? (
              <motion.div 
                key="create"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 sm:p-8 lg:p-10 text-center"
              >
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <ShieldAlert size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Create a Private Room</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 font-light leading-relaxed">Create a secure, temporary space for your conversation. No data is ever saved.</p>
                
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 disabled:opacity-70 hover:-translate-y-0.5"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <MessageSquare size={20} />}
                  {loading ? 'Generating Room...' : 'Generate Room & PIN'}
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="share"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col md:flex-row w-full"
              >
                {/* LEFT SIDE OF CARD: PIN & STATUS */}
                <div className="w-full md:w-[60%] p-4 sm:p-5 lg:p-6 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center">
                      <ShieldAlert size={16} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">Room Active</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">Awaiting secure peer connection</p>
                    </div>
                  </div>

                  <div className="text-center p-4 lg:p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 mb-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-500"></div>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs mb-2 uppercase tracking-widest font-semibold flex items-center justify-center gap-1">
                      Your Private PIN
                      <span className="text-emerald-500 ml-1">({Math.floor(roomTimeLeft / 60)}:{(roomTimeLeft % 60).toString().padStart(2, '0')})</span>
                    </p>
                    <div className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold tracking-[0.1em] sm:tracking-[0.2em] mb-3 drop-shadow-sm text-emerald-600 dark:text-emerald-400">
                      {createdPin}
                    </div>
                    <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-emerald-100/50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium">
                      <Loader2 size={14} className="animate-spin" /> Waiting for peer...
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={copyToClipboard}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-xl transition flex items-center justify-center gap-2 text-xs font-semibold"
                    >
                      <Copy size={16} /> {copiedPin ? 'Copied!' : 'Copy PIN'}
                    </button>
                    <button
                      onClick={shareNativeLink}
                      className="flex-1 py-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl transition flex items-center justify-center gap-2 text-xs font-semibold"
                    >
                      <Share2 size={16} /> Share Link
                    </button>
                  </div>
                </div>

                {/* RIGHT SIDE OF CARD: QR CODE */}
                <div className="w-full md:w-[40%] p-4 sm:p-5 lg:p-6 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-800/30">
                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium mb-3 text-center">Scan to connect</p>
                  <div className="bg-white p-2.5 lg:p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 relative group">
                    <div className="absolute inset-0 border-2 border-emerald-500/0 group-hover:border-emerald-500/30 rounded-2xl transition-colors pointer-events-none scale-[1.05]"></div>
                    <QRCodeSVG 
                      value={`${window.location.origin}/join/${createdPin}`} 
                      size={140} 
                      level="H"
                      includeMargin={false}
                      className="w-full h-auto max-w-[120px] lg:max-w-[140px]"
                    />
                  </div>
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] text-center mt-3 max-w-[160px] leading-relaxed">
                    Point a camera at this code to join automatically.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

    </div>
  );
};

export default CreateRoom;
