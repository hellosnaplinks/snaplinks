import { motion } from 'framer-motion';
import { Shield, ServerOff, Lock, EyeOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-32 pb-16 sm:pt-40 sm:pb-24 relative">
      
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-24 left-4 sm:left-6 md:left-8 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <div className="mb-12 sm:mb-16 text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Shield size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Privacy Policy</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Your privacy isn't just a feature—it's the entire foundation of SnapLinks. 
            Here is exactly how we handle (or rather, don't handle) your data.
          </p>
        </div>

        <div className="space-y-12 sm:space-y-16">
          
          {/* Section 1 */}
          <section className="bg-white/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 p-6 sm:p-8 rounded-3xl backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-xl">
                <ServerOff size={24} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">1. Zero Data Storage</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              SnapLinks does not store your messages, files, or IP addresses on any of our servers. Our infrastructure only serves to connect you to your peer (a process called "signaling"). The moment a secure WebRTC connection is established, our servers step out of the way. 
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-white/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 p-6 sm:p-8 rounded-3xl backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Lock size={24} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">2. End-to-End Encryption</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              All communications sent over SnapLinks are encrypted peer-to-peer using industry-standard WebRTC protocols (DTLS/SRTP). This means your data is encrypted on your device and can only be decrypted by the device you are communicating with. Even if we wanted to read your messages, it would be mathematically impossible for us to do so.
            </p>
          </section>

          {/* Section 3 */}
          <section className="bg-white/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 p-6 sm:p-8 rounded-3xl backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl">
                <EyeOff size={24} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">3. Analytics & Third Parties</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              To keep SnapLinks free and running, we use basic analytics (like Google Analytics) to understand aggregate traffic patterns, and we may display non-intrusive advertisements. 
            </p>
            <ul className="list-disc pl-5 text-slate-600 dark:text-slate-300 space-y-2">
              <li>These services do not have access to your chat content or the existence of your private rooms.</li>
              <li>They only collect standard web metrics (page views, browser type).</li>
              <li>You are entirely welcome to use SnapLinks with an ad-blocker or tracker-blocker enabled. It will not break the chat functionality.</li>
            </ul>
          </section>

          {/* Legal Boilerplate */}
          <section className="border-t border-slate-200 dark:border-slate-700 pt-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">4. Updates to this Policy</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              As we add new features (like file transfers), this policy may be updated. However, our core philosophy will never change: we don't want your data. We build tools that make it impossible for us to have it in the first place.
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-8">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </section>
          
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;
