import { motion, AnimatePresence } from 'framer-motion';
import { MoonStar, SunMedium } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`group flex items-center gap-3 px-3 py-2 rounded-2xl border border-[var(--border-muted)] bg-[var(--glass)] text-[var(--text-primary)] shadow-[0_4px_14px_rgba(15,23,42,0.08)] dark:shadow-[0_8px_22px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-0.5 hover:border-[var(--border-strong)] ${className}`}
      aria-label="Basculer le thème"
    >
      <div className="relative w-10 h-10">
        <AnimatePresence initial={false} mode="wait">
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/30 text-indigo-100"
            >
              <MoonStar className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-200 to-orange-300 text-amber-800"
            >
              <SunMedium className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="text-left leading-tight hidden sm:block">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Thème</p>
        <p className="text-sm font-semibold">
          {theme === 'dark' ? 'Mode sombre' : 'Mode clair'}
        </p>
      </div>
    </button>
  );
};

export default ThemeToggle;
