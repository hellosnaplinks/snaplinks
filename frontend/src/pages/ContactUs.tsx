import { motion } from 'framer-motion';
import { ArrowLeft, Mail, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContactUs = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-32 pb-16 sm:pt-40 sm:pb-24 relative">
      
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
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <MessageSquare size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Contact Us</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Have a question, feedback, or found a bug? We'd love to hear from you. Drop us a message below.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-lg bg-white/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 p-8 sm:p-12 rounded-3xl backdrop-blur-sm transition-all hover:bg-white/80 dark:hover:bg-slate-800/60 text-center flex flex-col items-center shadow-xl dark:shadow-2xl">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
              <Mail size={36} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Email Us</h3>
            <p className="text-slate-500 dark:text-slate-400 text-base mb-8 leading-relaxed">
              For general inquiries, support, or partnership opportunities, please reach out to us directly via email. We'll get back to you as soon as possible.
            </p>
            <a href="mailto:hello.snaplinks@gmail.com" className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 hover:-translate-y-0.5">
              <Mail size={20} />
              hello.snaplinks@gmail.com
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactUs;
