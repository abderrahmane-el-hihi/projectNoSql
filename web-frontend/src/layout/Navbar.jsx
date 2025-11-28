import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MoonStar, SunMedium, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ onMenuClick }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/login');
    showToast('Vous avez été déconnecté', 'info');
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-[var(--border-muted)] bg-[var(--glass)] backdrop-blur-xl shadow-[0_4px_12px_rgba(15,23,42,0.07)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.28)]">
      <div className="px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-xl text-[var(--text-primary)] hover:bg-[var(--primary-soft)] transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 via-indigo-500 to-accent-500 text-white font-bold text-lg flex items-center justify-center shadow-[0_12px_30px_rgba(99,102,241,0.35)]">
                GRH
              </div>
              <div className="hidden sm:block">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-muted)]">Pilotage</p>
                <h1 className="text-lg font-semibold text-[var(--text-primary)]">
                  Rendez-vous hospitaliers
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-[var(--primary-soft)] transition-colors text-[var(--text-primary)]"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-primary-100/80 to-accent-100/80 dark:from-primary-500/20 dark:to-accent-500/20 rounded-xl flex items-center justify-center shadow-inner">
                  <User className="w-5 h-5 text-primary-600 dark:text-primary-300" />
                </div>
                <div className="hidden sm:block text-left">
                  <span className="block text-xs text-[var(--text-muted)]">Connecté</span>
                  <span className="text-sm font-semibold">{user?.username || 'Utilisateur'}</span>
                </div>
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 rounded-2xl bg-[var(--surface)] border border-[var(--border-muted)] shadow-[0_10px_30px_rgba(15,23,42,0.14)] dark:shadow-[0_14px_34px_rgba(0,0,0,0.45)] py-2 z-50"
                    >
                      <div className="px-4 py-2 text-xs text-[var(--text-muted)]">
                        Connecté en tant que{' '}
                        <span className="font-semibold text-[var(--text-primary)]">{user?.role}</span>
                      </div>
                      <button
                        onClick={() => {
                          toggleTheme();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--primary-soft)] transition-colors"
                      >
                        {isDark ? (
                          <SunMedium className="w-4 h-4" />
                        ) : (
                          <MoonStar className="w-4 h-4" />
                        )}
                        {isDark ? 'Basculer en mode clair' : 'Basculer en mode sombre'}
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
