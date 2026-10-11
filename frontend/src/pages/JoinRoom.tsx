import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Loader2, Shield, QrCode, X, ArrowLeft, RefreshCw } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { Scanner } from '@yudiel/react-qr-scanner';

const JoinRoom = () => {
  const { pin: urlPin } = useParams<{ pin: string }>();
  const [pin, setPin] = useState(urlPin || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [scannerFacing, setScannerFacing] = useState<'environment' | 'user'>('environment');
  const timeoutRef = useRef<any>(null);
  
  const { initGuest, status } = useChat();
  const navigate = useNavigate();

  useEffect(() => {
    if (urlPin && urlPin.length === 6) {
      setPin(urlPin);
      handleJoin(urlPin);
    }
  }, [urlPin]);

  const statusRef = useRef(status);
  statusRef.current = status;

  useEffect(() => {
    if (status === 'connecting') {
      setHasAttempted(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (statusRef.current !== 'connected') {
          setLoading(false);
          setHasAttempted(false);
          setError('Connection timed out. Please verify the host is online and try again.');
        }
      }, 15000);
    } else if (status === 'connected') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      navigate(`/chat/${pin || urlPin}`);
    } else if (status === 'disconnected' && hasAttempted) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setLoading(false);
      setHasAttempted(false);
      setError('Connection failed or host disconnected. Please verify the PIN.');
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [status, navigate, pin, urlPin, hasAttempted]);

  const handleJoin = async (pinToJoin: string) => {
    if (pinToJoin.length !== 6 || !/^\d+$/.test(pinToJoin)) {
      setError('PIN must be exactly 6 digits');
      return;
    }
    
    setPin(pinToJoin);
    setError('');
    setLoading(true);
    setHasAttempted(true);
    try {
      await initGuest(pinToJoin);
    } catch (err: any) {
      setError(typeof err === 'string' ? err : (err?.message || 'Failed to join room'));
      setLoading(false);
      setHasAttempted(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleJoin(pin);
  };

  const handleScan = (detectedCodes: any[]) => {
    if (loading) return;
    if (detectedCodes && detectedCodes.length > 0) {
      const scannedVal = detectedCodes[0].rawValue || '';
      const match = scannedVal.match(/\/join\/(\d{6})/) || scannedVal.match(/\b(\d{6})\b/);
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
                <div className="w-full flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">Scan QR Code</h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setScannerFacing(prev => prev === 'environment' ? 'user' : 'environment')}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5"
                      title="Switch Camera"
                    >
                      <RefreshCw size={14} />
                      <span>{scannerFacing === 'environment' ? 'Rear' : 'Front'}</span>
                    </button>
                    <button 
                      onClick={() => setIsScanning(false)}
                      className="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition"
                      aria-label="Close scanner"
                    >
                      <X size={18} className="text-slate-600 dark:text-slate-300" />
                    </button>
                  </div>
                </div>
                
                <div className="w-full aspect-square bg-slate-900 rounded-2xl overflow-hidden relative shadow-inner border border-slate-200 dark:border-slate-700">
                  <Scanner 
                    onScan={handleScan}
                    onError={(err) => {
                      console.warn('QR scanner error:', err);
                      setError('Camera error: ' + (err?.message || 'Permission denied or camera busy.'));
                    }}
                    constraints={{
                      facingMode: { ideal: scannerFacing }
                    }}
                    styles={{
                      container: { width: '100%', height: '100%' },
                      video: { width: '100%', height: '100%', objectFit: 'cover' }
                    }}
                    components={{ zoom: true }}
                    paused={loading}
                  />
                  <div className="absolute inset-0 pointer-events-none border-[4px] border-emerald-500/50 rounded-2xl z-10 m-8"></div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 text-center">
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
