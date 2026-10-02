import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, History, Sun, Moon } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { useToast } from '../hooks/useToast';

function BackgroundSessionRefresher() {
  const accessToken = useAuthStore(state => state.accessToken);

  useEffect(() => {
    if (!accessToken) return;

    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const exp = payload.exp * 1000;
      
      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((exp - now) / 1000));

        if (remaining === 0) {
          apiClient.get('/api/auth/get-user').catch(() => {});
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } catch (e) {
      // invalid token
    }
  }, [accessToken]);

  return null;
}

export function AppLayout() {
  const { user, clearAuth } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { error } = useToast();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setTimeout(async () => {
      try {
        await apiClient.post('/api/auth/logout');
      } catch (e) {
        error('Server logout failed, but local session was cleared.');
      } finally {
        clearAuth();
        queryClient.clear();
        navigate('/login', { replace: true });
      }
    }, 100);
  };

  useEffect(() => {
    const handleRateLimit = () => setIsRateLimited(true);
    window.addEventListener('api-rate-limit', handleRateLimit);
    return () => window.removeEventListener('api-rate-limit', handleRateLimit);
  }, []);

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink">
      <BackgroundSessionRefresher />
      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full border-b-2 border-ink bg-surface">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/app" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded-sm">
            <div className="w-8 h-8 bg-yellow neo-border flex items-center justify-center text-ink font-bold text-sm">
              RM
            </div>
            <span className="font-display font-bold text-lg hidden sm:block">Resume Job Matcher</span>
          </Link>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-circle bg-yellow neo-border neo-shadow-sm hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_var(--shadow-color)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all duration-[120ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ink"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun size={18} className="text-ink" /> : <Moon size={18} className="text-ink" />}
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ink rounded-circle"
                aria-label="User menu"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div className="w-9 h-9 rounded-circle bg-purple flex items-center justify-center text-sm font-bold text-ink neo-border hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_var(--shadow-color)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all duration-[120ms]">
                  {user ? getInitials(user.username) : 'U'}
                </div>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="fixed inset-0 z-40"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-48 bg-surface neo-border neo-shadow rounded-neo z-50 overflow-hidden flex flex-col"
                    >
                      <div className="p-3 bg-yellow border-b-2 border-ink">
                        <p className="text-sm font-bold truncate text-ink">{user?.username}</p>
                        <p className="text-xs text-ink truncate">{user?.email}</p>
                      </div>
                      <div className="flex flex-col">
                        <Link 
                          to="/app/account" 
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-3 text-sm font-bold text-ink hover:bg-yellow border-b-2 border-ink transition-colors"
                        >
                          <User size={16} />
                          Account
                        </Link>
                        <Link 
                          to="/app/history" 
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-3 text-sm font-bold text-ink hover:bg-yellow border-b-2 border-ink transition-colors"
                        >
                          <History size={16} />
                          History
                        </Link>
                        <button 
                          onClick={() => {
                            setDropdownOpen(false);
                            const event = new CustomEvent('open-logout-modal');
                            window.dispatchEvent(event);
                          }}
                          className="flex items-center gap-2 px-3 py-3 text-sm font-bold text-ink bg-danger hover:bg-danger/80 transition-colors w-full text-left"
                        >
                          <LogOut size={16} />
                          Log out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isRateLimited && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-danger border-b-2 border-ink text-ink px-4 py-3 text-center text-sm font-bold z-30 relative"
          >
            You have hit the API rate limit (100 requests per 15 minutes). Some features may be temporarily unavailable.
            <button 
              onClick={() => setIsRateLimited(false)}
              className="ml-4 underline hover:text-white"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 relative">
        <AnimatePresence>
          {isLoggingOut && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-bg z-50 flex items-center justify-center"
            >
              <div className="w-16 h-16 rounded-circle bg-danger neo-border flex items-center justify-center">
                <LogOut className="text-ink" size={32} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isLoggingOut && <Outlet />}
      </main>

      <LogoutModal 
        onConfirm={handleLogout} 
      />
    </div>
  );
}

function LogoutModal({ onConfirm }: { onConfirm: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-logout-modal', handleOpen);
    return () => window.removeEventListener('open-logout-modal', handleOpen);
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-circle bg-danger neo-border flex items-center justify-center mx-auto mb-4">
          <LogOut size={24} className="text-ink" />
        </div>
        <h2 className="text-xl font-display font-bold mb-2 text-ink">Ready to log out?</h2>
        <p className="text-sm font-medium text-ink mb-6">
          You are about to log out of your session. You'll need to sign in again to access your job matches.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            className="flex-1" 
            onClick={() => {
              setIsOpen(false);
              onConfirm();
            }}
          >
            Log out
          </Button>
        </div>
      </div>
    </Modal>
  );
}
