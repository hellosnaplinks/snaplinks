import { useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Lock, Zap, FileText, ChevronRight, ServerOff } from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 20 } },
};

const LandingPage = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          // Adjust for navbar height
          const y = element.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  return (
    <div className="flex-1 flex flex-col w-full relative overflow-hidden">
      
      {/* GLOBAL BACKGROUND MESH - Responsive sizes for all screens */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[100vw] h-[100vw] sm:w-[70vw] sm:h-[70vw] lg:w-[50vw] lg:h-[50vw] 2xl:w-[40vw] 2xl:h-[40vw] bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-[80px] sm:blur-[100px] 2xl:blur-[150px]"
        />
        <motion.div 
          animate={{ rotate: -360, scale: [1, 1.2, 1] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] -right-[10%] w-[90vw] h-[90vw] sm:w-[60vw] sm:h-[60vw] lg:w-[45vw] lg:h-[45vw] 2xl:w-[35vw] 2xl:h-[35vw] bg-cyan-500/10 dark:bg-cyan-500/20 rounded-full blur-[80px] sm:blur-[100px] 2xl:blur-[150px]"
        />
      </div>

      {/* SECTION 1: HERO */}
      <section className="w-full px-4 sm:px-6 md:px-8 pt-24 sm:pt-32 pb-16 flex flex-col items-center relative z-10 min-h-[85svh] 2xl:min-h-[70svh] justify-center">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[120rem] mx-auto flex flex-col items-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-6 2xl:mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 2xl:px-6 2xl:py-2.5 rounded-full bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 text-xs sm:text-sm 2xl:text-lg font-medium border border-slate-200 dark:border-slate-700/50 backdrop-blur-md shadow-sm">
              <span className="relative flex h-2 w-2 2xl:h-3 2xl:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 2xl:h-3 2xl:w-3 bg-emerald-500"></span>
              </span>
              No Logs &bull; Peer-to-Peer Encrypted
            </div>
          </motion.div>

          {/* Hero Headline */}
          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl 2xl:text-[7rem] font-bold text-center text-slate-900 dark:text-white tracking-tight leading-[1.1] sm:leading-[1.05] mb-4 sm:mb-6 2xl:mb-10 max-w-[90%] md:max-w-4xl 2xl:max-w-7xl">
            Private conversations. <br className="hidden sm:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500 dark:from-emerald-400 dark:to-cyan-400">
              Zero digital footprint.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={itemVariants} className="text-base sm:text-lg md:text-xl 2xl:text-3xl text-slate-600 dark:text-slate-400 text-center max-w-[90%] md:max-w-3xl 2xl:max-w-5xl mb-8 sm:mb-12 2xl:mb-16 leading-relaxed font-light">
            Instant browser-to-browser chat powered by WebRTC. No logins, no servers storing history, and messages vanish when you leave.
          </motion.p>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col items-center gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 2xl:gap-8 w-full px-4 sm:px-0 justify-center">
              <Link 
                to="/create" 
                className="group relative px-6 py-3 sm:px-8 sm:py-4 2xl:px-12 2xl:py-6 w-full sm:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-base sm:text-lg 2xl:text-2xl font-semibold rounded-full transition-transform hover:scale-[1.02] sm:hover:scale-105 flex items-center justify-center gap-2 overflow-hidden shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 2xl:w-7 2xl:h-7 relative z-10" />
                <span className="relative z-10">Create a Room</span>
              </Link>
              <Link 
                to="/join" 
                className="group px-6 py-3 sm:px-8 sm:py-4 2xl:px-12 2xl:py-6 w-full sm:w-auto bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 text-slate-900 dark:text-white text-base sm:text-lg 2xl:text-2xl font-semibold rounded-full border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 backdrop-blur-md"
              >
                Join with PIN <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 2xl:w-7 2xl:h-7 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium tracking-wide">
              Free &bull; Open Source &bull; No Signup Required
            </p>
          </motion.div>

          {/* Visual Proof / Mockup */}
          <motion.div 
            variants={itemVariants}
            className="mt-16 sm:mt-24 w-full max-w-3xl mx-auto px-4 relative perspective-1000"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-900 via-transparent to-transparent z-20 h-full pointer-events-none rounded-2xl"></div>
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-2xl p-6 shadow-2xl relative z-10 rotate-x-12 transform-style-3d border-t-white/80 dark:border-t-slate-600/80"
            >
              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/50 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Anonymous Peer</h3>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Connected Securely
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-medium rounded-full border border-rose-100 dark:border-rose-800/30">
                  Auto-destructs on disconnect
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-700 px-4 py-2 rounded-2xl rounded-tl-sm text-sm text-slate-700 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-600">
                    Are the files encrypted?
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-emerald-500 text-white px-4 py-2 rounded-2xl rounded-tr-sm text-sm shadow-sm">
                    Yes, fully end-to-end. I'll drop it now.
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-2xl rounded-tr-sm flex items-center gap-3 shadow-sm w-64">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">secure_keys.zip</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">12.4 MB &bull; Direct Transfer</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </motion.div>
      </section>

      {/* SECTION 2: BENTO FEATURES */}
      <section id="features" className="w-full px-4 sm:px-6 md:px-8 py-16 sm:py-24 md:py-32 2xl:py-48 relative z-10 bg-white/30 dark:bg-slate-900/30 backdrop-blur-2xl border-y border-white/20 dark:border-slate-700/30">
        <div className="max-w-[120rem] mx-auto w-full">
          <div className="text-center mb-10 sm:mb-16 2xl:mb-24 px-4">
            <h2 className="text-2xl sm:text-3xl md:text-5xl 2xl:text-7xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 2xl:mb-8">Built for absolute privacy</h2>
            <p className="text-sm sm:text-base md:text-lg 2xl:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl 2xl:max-w-4xl mx-auto">SnapLinks was engineered from the ground up to ensure your conversations cannot be intercepted, recorded, or stored.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 2xl:gap-10 max-w-6xl 2xl:max-w-[100rem] mx-auto md:auto-rows-fr">
            
            {/* Large Feature Card (Top Left) */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-2 lg:col-span-2 group relative p-6 sm:p-8 2xl:p-12 rounded-2xl sm:rounded-3xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/50 backdrop-blur-xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col h-full justify-between"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col sm:flex-row gap-6 sm:gap-8 h-full justify-between">
                <div className="flex flex-col justify-between flex-1">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 2xl:w-20 2xl:h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 sm:mb-6 2xl:mb-10 group-hover:scale-110 transition-transform duration-500">
                    <ServerOff className="w-6 h-6 sm:w-7 sm:h-7 2xl:w-10 2xl:h-10" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl 2xl:text-4xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 2xl:mb-6 tracking-tight">Zero-Knowledge Architecture</h3>
                    <p className="text-sm sm:text-base 2xl:text-xl text-slate-500 dark:text-slate-400 leading-[1.7] font-normal">
                      Signals connect peers directly. With zero databases in the loop, messages cannot be logged, leaked, or intercepted.
                    </p>
                  </div>
                </div>
                
                {/* Mini-graphic for visual balance */}
                <div className="hidden sm:flex flex-shrink-0 w-32 2xl:w-48 items-center justify-center opacity-30 dark:opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="relative w-full h-24 2xl:h-32 flex items-center justify-between">
                    <div className="w-8 h-8 2xl:w-12 2xl:h-12 bg-emerald-500 rounded-full flex items-center justify-center z-10">
                      <div className="w-3 h-3 2xl:w-4 2xl:h-4 bg-white rounded-full animate-ping"></div>
                    </div>
                    <div className="absolute left-4 right-4 h-0.5 bg-emerald-500/50 border-t-2 border-dashed border-emerald-500/50"></div>
                    <div className="w-8 h-8 2xl:w-12 2xl:h-12 bg-cyan-500 rounded-full flex items-center justify-center z-10">
                      <div className="w-3 h-3 2xl:w-4 2xl:h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Small Feature Card 1 (Top Right) */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="group p-6 sm:p-8 2xl:p-12 rounded-2xl sm:rounded-3xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/50 backdrop-blur-xl shadow-lg transition-all duration-300 flex flex-col h-full justify-between"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 2xl:w-16 2xl:h-16 bg-cyan-100 dark:bg-cyan-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-4 sm:mb-6 2xl:mb-10 group-hover:scale-110 transition-transform duration-500">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 2xl:w-8 2xl:h-8" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl 2xl:text-3xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2 2xl:mb-4 tracking-tight">Direct Peer-to-Peer</h3>
                <p className="text-xs sm:text-sm 2xl:text-lg text-slate-500 dark:text-slate-400 font-normal leading-[1.7]">
                  Direct browser-to-browser data channels eliminate middleman servers, delivering messages and media with near-zero latency.
                </p>
              </div>
            </motion.div>

            {/* Small Feature Card 2 (Bottom Left) */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="group p-6 sm:p-8 2xl:p-12 rounded-2xl sm:rounded-3xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/50 backdrop-blur-xl shadow-lg transition-all duration-300 flex flex-col h-full justify-between"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 2xl:w-16 2xl:h-16 bg-teal-100 dark:bg-teal-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4 sm:mb-6 2xl:mb-10 group-hover:scale-110 transition-transform duration-500">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 2xl:w-8 2xl:h-8" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl 2xl:text-3xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2 2xl:mb-4 tracking-tight">Unlimited P2P File Transfer</h3>
                <p className="text-xs sm:text-sm 2xl:text-lg text-slate-500 dark:text-slate-400 font-normal leading-[1.7]">
                  Send images, PDFs, and large files directly to your peer with no cloud uploads and zero file size caps.
                </p>
              </div>
            </motion.div>

            {/* Wide Feature Card (Bottom Right) */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-2 lg:col-span-2 group p-6 sm:p-8 2xl:p-12 rounded-2xl sm:rounded-3xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/50 backdrop-blur-xl shadow-lg transition-all duration-300 flex flex-col sm:flex-row items-center h-full justify-between gap-6"
            >
              <div className="text-center sm:text-left flex-1">
                <div className="inline-flex items-center justify-center p-2 sm:p-3 2xl:p-5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg sm:rounded-xl mb-3 sm:mb-4 2xl:mb-8 group-hover:scale-110 transition-transform duration-500">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 2xl:w-10 2xl:h-10" />
                </div>
                <h3 className="text-lg sm:text-xl 2xl:text-3xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2 2xl:mb-4 tracking-tight">Hardware-Level DTLS Encryption</h3>
                <p className="text-xs sm:text-sm 2xl:text-lg text-slate-500 dark:text-slate-400 max-w-md 2xl:max-w-2xl font-normal leading-[1.7]">
                  Every packet is encrypted end-to-end via standard Datagram Transport Layer Security (DTLS). Only the connected peers hold the keys.
                </p>
              </div>
              <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 2xl:w-48 2xl:h-48 opacity-20 dark:opacity-40 relative flex items-center justify-center pointer-events-none mt-4 sm:mt-0">
                <div className="absolute inset-0 border-[3px] sm:border-4 border-dashed border-emerald-500 rounded-full animate-[spin_10s_linear_infinite]" />
                <Shield className="w-10 h-10 sm:w-12 sm:h-12 2xl:w-20 2xl:h-20 text-emerald-500" />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section id="how-it-works" className="w-full px-4 sm:px-6 md:px-8 py-16 sm:py-24 md:py-32 2xl:py-48 relative z-10 overflow-hidden">
        <div className="max-w-[120rem] mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 sm:mb-24 2xl:mb-32 px-4"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl 2xl:text-7xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 2xl:mb-8 tracking-tight">How it works</h2>
            <p className="text-base sm:text-lg md:text-xl 2xl:text-3xl text-slate-600 dark:text-slate-400 max-w-3xl 2xl:max-w-5xl mx-auto font-light">No accounts, no downloads. Just share a PIN and connect instantly.</p>
          </motion.div>
          
          <div className="relative max-w-6xl 2xl:max-w-[100rem] mx-auto">
            {/* Animated Connecting Line on desktop */}
            <div className="hidden md:block absolute top-[4rem] sm:top-[4rem] 2xl:top-[7rem] left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-emerald-500/30 z-0 overflow-hidden">
              <motion.div 
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 2xl:gap-20 relative">
              
              {/* Step 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, type: "spring", bounce: 0.4, delay: 0.3 }}
                whileHover={{ y: -5 }}
                className="relative z-10 flex flex-col items-center text-center p-8 2xl:p-12 rounded-[2rem] sm:rounded-[3rem] bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all h-full"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 2xl:w-32 2xl:h-32 rounded-full bg-emerald-500 text-white flex items-center justify-center text-2xl sm:text-3xl 2xl:text-5xl font-bold mb-6 sm:mb-8 2xl:mb-12 shadow-[0_0_30px_rgba(16,185,129,0.4)] ring-4 sm:ring-8 ring-white/50 dark:ring-slate-900/50 relative">
                  1
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-20" />
                </div>
                
                {/* Visual Hint */}
                <div className="mb-4 bg-slate-100 dark:bg-slate-700/50 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 font-mono text-emerald-600 dark:text-emerald-400 tracking-[0.3em] text-sm sm:text-base font-bold shadow-inner">
                  &bull; &bull; &bull; &bull; &bull; &bull;
                </div>

                <h3 className="text-xl sm:text-2xl 2xl:text-4xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 2xl:mb-6 tracking-tight">Create Room</h3>
                <p className="text-sm sm:text-base 2xl:text-xl text-slate-600 dark:text-slate-400 font-light leading-relaxed">Click to generate a temporary, one-time 6-digit code. No email or signup needed.</p>
              </motion.div>

              {/* Step 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, type: "spring", bounce: 0.4, delay: 0.6 }}
                whileHover={{ y: -5 }}
                className="relative z-10 flex flex-col items-center text-center p-8 2xl:p-12 rounded-[2rem] sm:rounded-[3rem] bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all h-full"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 2xl:w-32 2xl:h-32 rounded-full bg-emerald-500 text-white flex items-center justify-center text-2xl sm:text-3xl 2xl:text-5xl font-bold mb-6 sm:mb-8 2xl:mb-12 shadow-[0_0_30px_rgba(16,185,129,0.4)] ring-4 sm:ring-8 ring-white/50 dark:ring-slate-900/50 relative">
                  2
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-20" />
                </div>
                
                {/* Visual Hint */}
                <div className="mb-4 bg-white dark:bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-xs sm:text-sm shadow-sm flex items-center">
                  <span className="text-slate-400 dark:text-slate-500">snaplinks.in/</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">948215</span>
                </div>

                <h3 className="text-xl sm:text-2xl 2xl:text-4xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 2xl:mb-6 tracking-tight">Share PIN</h3>
                <p className="text-sm sm:text-base 2xl:text-xl text-slate-600 dark:text-slate-400 font-light leading-relaxed">Send the code or room link to your peer to authorize the direct peer-to-peer connection.</p>
              </motion.div>

              {/* Step 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, type: "spring", bounce: 0.4, delay: 0.9 }}
                whileHover={{ y: -5 }}
                className="relative z-10 flex flex-col items-center text-center p-8 2xl:p-12 rounded-[2rem] sm:rounded-[3rem] bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all h-full"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 2xl:w-32 2xl:h-32 rounded-full bg-emerald-500 text-white flex items-center justify-center text-2xl sm:text-3xl 2xl:text-5xl font-bold mb-6 sm:mb-8 2xl:mb-12 shadow-[0_0_30px_rgba(16,185,129,0.4)] ring-4 sm:ring-8 ring-white/50 dark:ring-slate-900/50 relative">
                  3
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-20" />
                </div>
                
                {/* Visual Hint */}
                <div className="mb-4 flex items-center gap-2">
                  <div className="w-8 h-6 bg-slate-200 dark:bg-slate-700 rounded-lg rounded-tl-sm"></div>
                  <div className="w-10 h-6 bg-emerald-500 rounded-lg rounded-tr-sm opacity-80 group-hover:opacity-100 transition-opacity"></div>
                </div>

                <h3 className="text-xl sm:text-2xl 2xl:text-4xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 2xl:mb-6 tracking-tight">Connect Securely</h3>
                <p className="text-sm sm:text-base 2xl:text-xl text-slate-600 dark:text-slate-400 font-light leading-relaxed">Chat and transfer files peer-to-peer. The moment you close the tab, all session data disappears forever.</p>
              </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: FAQ */}
      <section id="faq" className="w-full px-4 sm:px-6 md:px-8 py-16 sm:py-24 md:py-32 relative z-10 bg-white/30 dark:bg-slate-900/30 backdrop-blur-2xl border-y border-white/20 dark:border-slate-700/30">
        <div className="max-w-4xl 2xl:max-w-6xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16 2xl:mb-20 px-4"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl 2xl:text-7xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-base sm:text-lg 2xl:text-2xl text-slate-600 dark:text-slate-400">Everything you need to know about SnapLinks and how it keeps your data secure.</p>
          </motion.div>

          <div className="space-y-4 2xl:space-y-6">
            {[
              {
                q: "Is SnapLinks really 100% free?",
                a: "Yes. Since we don't store your messages or files on any centralized servers, our hosting costs are incredibly low. SnapLinks is completely free to use without any ads."
              },
              {
                q: "How does the privacy work?",
                a: "We use WebRTC to establish a direct, peer-to-peer connection between your browser and your contact's browser. Our servers are only used for the initial 'handshake' to connect you. After that, your data flows directly between devices, encrypted end-to-end."
              },
              {
                q: "What happens if I close the tab?",
                a: "The connection is instantly severed and all chat history is destroyed. Because we do not store chat logs on any server, there is no way to recover messages once the session is closed."
              },
              {
                q: "Are there any file size limits?",
                a: "No. Because files are sent directly from your device to your peer's device (bypassing our servers), the only limit is the speed and stability of your own internet connection."
              }
            ].map((faq, idx) => (
              <motion.details 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/50 rounded-2xl py-5 px-6 sm:px-8 [&_summary::-webkit-details-marker]:hidden shadow-sm hover:shadow-md hover:border-emerald-400/50 dark:hover:border-emerald-500/50 open:border-emerald-500/50 dark:open:border-emerald-500/50 open:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all duration-300"
              >
                <summary className="flex items-center justify-between cursor-pointer font-semibold text-lg sm:text-xl 2xl:text-2xl text-slate-900 dark:text-white">
                  {faq.q}
                  <span className="transform transition-transform duration-300 group-open:rotate-180 bg-slate-100 dark:bg-slate-700 rounded-full p-2 text-slate-700 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-slate-600">
                    <svg fill="none" height="20" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <p className="mt-4 text-slate-600 dark:text-slate-400 text-base sm:text-lg 2xl:text-xl font-normal leading-relaxed pr-8 animate-in fade-in slide-in-from-top-2 duration-300">
                  {faq.a}
                </p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full relative z-10 bg-white/50 dark:bg-[#0f172a]/80 backdrop-blur-md py-6 border-t border-slate-200/80 dark:border-slate-800/80 font-mono text-xs sm:text-sm">
        <div className="max-w-[120rem] mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 md:grid-cols-3 items-center gap-4 md:gap-0 text-slate-600 dark:text-slate-400 font-medium">
          
          <div className="flex items-center justify-center md:justify-start gap-2 order-2 md:order-1">
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M14.83 14.83a4 4 0 1 1 0-5.66"/></svg>
              {new Date().getFullYear()} SnapLinks
            </span>
            <span className="hidden lg:inline text-slate-400 dark:text-slate-600 px-2">•</span>
            <span className="hidden lg:flex items-center">
              <span className="text-emerald-500 mr-2 animate-pulse">●</span> Private
            </span>
          </div>

          <div className="flex items-center justify-center text-slate-500 dark:text-slate-500 order-1 md:order-2">
            <span className="cursor-pointer hover:underline hover:text-slate-700 dark:hover:text-slate-300 transition-all underline-offset-4 decoration-emerald-500/50 hover:decoration-emerald-500">Built by Dhyey Raja</span>
          </div>

          <div className="flex flex-wrap justify-center md:justify-end items-center gap-3 sm:gap-4 order-3 md:order-3">
            <a href="#faq" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">FAQ</a>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <Link to="/privacy" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Privacy</Link>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <Link to="/about" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">About Us</Link>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <Link to="/contact" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Contact Us</Link>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
