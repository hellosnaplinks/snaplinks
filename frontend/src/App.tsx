import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import LandingPage from './pages/LandingPage';
import CreateRoom from './pages/CreateRoom';
import JoinRoom from './pages/JoinRoom';
import ChatRoom from './pages/ChatRoom';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import { useTheme } from './context/ThemeContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 flex flex-col font-sans transition-colors duration-300">
        {/* Floating Glass Navbar */}
        <nav className="fixed top-0 left-0 right-0 w-full z-50 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl transition-colors duration-300">
          <div className="relative w-full max-w-[120rem] mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
            
            {/* Left: Logo */}
            <div className="flex items-center gap-3 z-20">
              <Link to="/" className="flex items-center shrink-0">
                <img 
                  src={theme === 'dark' ? "/logo-dark.png" : "/logo.png"} 
                  alt="SnapLinks Logo" 
                  className="h-8 sm:h-9 md:h-10 2xl:h-12 w-auto object-contain mix-blend-multiply dark:mix-blend-normal drop-shadow-sm transition-opacity duration-300 hover:opacity-90 active:opacity-75"
                />
              </Link>
            </div>

            {/* Center: Desktop Navigation Links */}
            <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center space-x-6 md:space-x-8 2xl:space-x-12 text-sm md:text-base 2xl:text-xl font-medium text-slate-500 dark:text-slate-400">
              <Link to="/#features" className="hover:text-slate-900 dark:hover:text-white transition">Features</Link>
              <Link to="/#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition">How it Works</Link>
              <Link to="/#faq" className="hover:text-slate-900 dark:hover:text-white transition">FAQ</Link>
            </div>

            {/* Right: Theme Toggle */}
            <div className="flex items-center shrink-0 z-20">
              <button
                onClick={toggleTheme}
                className={`relative flex items-center w-14 sm:w-16 h-7 sm:h-8 2xl:w-20 2xl:h-10 bg-slate-200/80 dark:bg-slate-800/80 rounded-full p-1 cursor-pointer transition-colors duration-500 shadow-inner shrink-0 ${theme === 'dark' ? 'justify-end' : 'justify-start'}`}
                aria-label="Toggle Theme"
              >
                <motion.div
                  layout
                  className="w-5 h-5 sm:w-6 sm:h-6 2xl:w-8 2xl:h-8 bg-white dark:bg-slate-900 rounded-full shadow-md z-10"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
                <div className="absolute inset-0 w-full h-full flex justify-between items-center px-1.5 sm:px-2 z-20 pointer-events-none">
                  <Sun className={`w-3.5 h-3.5 sm:w-4 sm:h-4 2xl:w-5 2xl:h-5 transition-colors duration-300 ${theme === 'light' ? 'text-amber-500' : 'text-slate-400 opacity-50'}`} />
                  <Moon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 2xl:w-5 2xl:h-5 transition-colors duration-300 ${theme === 'dark' ? 'text-indigo-400' : 'text-slate-500 opacity-50'}`} />
                </div>
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/create" element={<CreateRoom />} />
            <Route path="/join" element={<JoinRoom />} />
            <Route path="/join/:pin" element={<JoinRoom />} />
            <Route path="/chat/:pin" element={<ChatRoom />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<div className="pt-32 px-4 pb-20 text-center"><h1 className="text-3xl font-bold mb-4">Terms of Service</h1><p>User agreement and terms.</p></div>} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
