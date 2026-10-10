import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Loader2, Shield, QrCode, X, ArrowLeft } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { Scanner } from '@yudiel/react-qr-scanner';

const JoinRoom = () => {
  const { pin: urlPin } = useParams<{ pin: string }>();
  const [pin, setPin] = useState(urlPin || '');
    const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  
  const { initGuest, status } = useChat();
  const navigate = useNavigate();

  useEffect(() => {
    if (urlPin && urlPin.length === 6) {
      handleJoin(urlPin);
    }
  }, [urlPin]);

    useEffect(() => {
    if (status === 'connecting') {
      setHasAttempted(true);
    } else if (status === 'connected') {
      navigate(`/chat/${pin}`);
    } else if (status === 'disconnected' && hasAttempted) {
      setLoading(false);
      setHasAttempted(false);
      setError('Connection failed or host disconnected.');
    }
  }, [status, navigate, pin, hasAttempted]);

  const handleJoin = async (pinToJoin: string) => {
    if (pinToJoin.length !== 6 || !/^\d+$/.test(pinToJoin)) {
      setError('PIN must be exactly 6 digits');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      await initGuest(pinToJoin);
    } catch (err: any) {
      setError(err || 'Failed to join room');
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleJoin(pin);
  };

  const handleScan = (detectedCodes: any[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const scannedVal = detectedCodes[0].rawValue;
      const match = scannedVal.match(/(?:\/join\/|^)(\d{6})/);
      if (match) {
        const foundPin = match[1];
        setPin(foundPin);
        setIsScanning(false);
        handleJoin(foundPin);
      }
    }
  };

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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-xl dark:shadow-2xl overflow-hidden relative"
        >
          <AnimatePresence mode="wait">
            {isScanning ? (
              <motion.div
                key="scanner"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center"
              >
                <div className="w-full flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">Scan QR Code</h3>
                  <button 
                    onClick={() => setIsScanning(false)}
                    className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition"
                  >
                    <X size={20} className="text-slate-600 dark:text-slate-300" />
                  </button>
                </div>
                
                <div className="w-full aspect-square bg-slate-900 rounded-2xl overflow-hidden relative shadow-inner border border-slate-200 dark:border-slate-700">
                  <Scanner 
                    onScan={handleScan}
                    components={{ zoom: true }}
                  />
                  <div className="absolute inset-0 pointer-events-none border-[4px] border-emerald-500/50 rounded-2xl z-10 m-8"></div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-6 text-center">
                  Point your camera at the host's QR code to connect automatically.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Join Private Chat</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Enter the 6-digit PIN shared by your peer.</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                  <div>
                    <input
                      type="text"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full text-center text-3xl sm:text-4xl font-mono font-bold tracking-[0.2em] sm:tracking-[0.3em] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 rounded-xl py-3 sm:py-4 focus:outline-none focus:border-emerald-500 transition placeholder-slate-300 dark:placeholder-slate-700"
                    />
                    {error && <p className="text-red-500 dark:text-red-400 text-sm mt-2 text-center">{error}</p>}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsScanning(true)}
                      className="w-14 shrink-0 py-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all flex items-center justify-center"
                      aria-label="Scan QR Code"
                    >
                      <QrCode size={20} />
                    </button>
                    <button
                      type="submit"
                      disabled={loading || pin.length !== 6}
                      className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
                      {loading ? 'Connecting...' : 'Join Room'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

    </div>
  );
};

export default JoinRoom;
