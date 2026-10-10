import { motion } from 'framer-motion';
import { ArrowLeft, Code2, Heart, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutUs = () => {
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
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Heart size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">About SnapLinks</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            We believe that private, frictionless communication shouldn't require trading your personal data.
          </p>
        </div>

        <div className="space-y-8 sm:space-y-12">
          
          {/* Mission Section */}
          <section className="bg-white/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 p-6 sm:p-8 rounded-3xl backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Zap size={24} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              SnapLinks was born out of a simple frustration: why does sharing a link, sending a file, or starting a quick chat require creating an account, downloading an app, or trusting a server with your data? By leveraging WebRTC technology, we built a tool that connects browsers directly to each other. No middlemen, no databases, no compromises.
            </p>
          </section>

          {/* Builder Section */}
          <section className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/60 dark:to-slate-900/60 border border-slate-200 dark:border-slate-700/50 p-6 sm:p-8 rounded-3xl backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Code2 size={24} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">The Creator</h2>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  SnapLinks is designed, built, and maintained by <strong>Dhyey Raja</strong>. It is a passion project focused on pushing the boundaries of what modern browsers can do without relying on heavy backend infrastructure.
                </p>
              </div>
              <div className="w-full sm:w-auto flex justify-center sm:justify-end shrink-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-3xl sm:text-4xl shadow-inner border-4 border-white dark:border-slate-800">
                  👨‍💻
                </div>
              </div>
            </div>
          </section>

        </div>
      </motion.div>
    </div>
  );
};

export default AboutUs;
