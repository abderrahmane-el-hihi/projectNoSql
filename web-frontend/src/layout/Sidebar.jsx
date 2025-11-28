import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  BarChart3,
  Activity,
  UserCircle2,
  Bell,
  X,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/patients', label: 'Patients', icon: Users },
    { path: '/doctors', label: 'Médecins', icon: Stethoscope },
    { path: '/appointments', label: 'Rendez-vous', icon: Calendar },
    { path: '/doctor-dashboard', label: 'Vue Médecin', icon: Activity },
    { path: '/patient-portal', label: 'Portail patient', icon: UserCircle2 },
    { path: '/notifications', label: 'Notifications', icon: Bell },
    { path: '/reports', label: 'Rapports', icon: BarChart3 },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : '-110%' }}
        transition={{ type: 'spring', damping: 24, stiffness: 180 }}
        className="fixed inset-y-0 left-0 z-50 w-[min(280px,90vw)] lg:w-[var(--sidebar-width)] bg-[var(--glass)] border-r border-[var(--border-muted)] shadow-[0_6px_18px_rgba(15,23,42,0.1)] dark:shadow-[0_10px_26px_rgba(0,0,0,0.3)] frosted flex flex-col overflow-hidden backdrop-saturate-150"
      >
        <div className="absolute inset-0 opacity-90" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between px-5 py-5 border-b border-[var(--border-muted)] bg-[var(--surface-strong)]/80">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--text-muted)] mb-1">GRH</p>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Navigation</h2>
              <p className="text-xs text-[var(--text-subtle)]">Gestion intelligente</p>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg text-[var(--text-subtle)] hover:bg-[var(--primary-soft)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="relative flex-1 px-4 py-5 space-y-2 overflow-y-auto scrollbar-soft">
            <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.35em] px-2">
              Pages
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link key={item.path} to={item.path} onClick={onClose} className="block">
                  <motion.div
                    whileHover={{ x: 6 }}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200 ${
                      active
                        ? 'bg-[var(--primary-soft)] border-[var(--border-strong)] text-[var(--primary-strong)] shadow-[0_14px_30px_rgba(79,70,229,0.18)]'
                        : 'text-[var(--text-primary)] border-transparent hover:border-[var(--border-muted)] hover:bg-[var(--surface-strong)]/60'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="activeNav"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 rounded-r-full bg-gradient-to-b from-primary-500 to-accent-500"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-[var(--primary-strong)]' : 'text-[var(--text-muted)]'}`} />
                    <span className="flex-1 text-sm font-medium">{item.label}</span>
                    {active && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-[var(--primary-strong)] rounded-full shadow-sm"
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          <div className="relative px-5 py-4 border-t border-[var(--border-muted)] bg-[var(--surface-strong)]/80">
            <div className="rounded-2xl px-4 py-3 bg-[var(--primary-soft)] border border-[var(--border-muted)] text-[var(--text-primary)] shadow-[0_4px_12px_rgba(15,23,42,0.08)] dark:shadow-[0_6px_14px_rgba(0,0,0,0.22)]">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)] mb-1">Plateforme</p>
              <p className="text-sm font-semibold">GRH System v1.0</p>
              <p className="text-xs text-[var(--text-subtle)]">Rendez-vous hospitaliers modernisés</p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
