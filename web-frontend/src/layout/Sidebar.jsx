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
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed lg:static inset-y-0 left-0 z-50 lg:z-auto w-72 bg-white/85 border-r border-white/60 shadow-[0_15px_35px_rgba(15,23,42,0.18)] backdrop-blur-2xl flex flex-col"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/60 bg-gradient-to-r from-white/70 via-white/40 to-white/20">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-gray-500 mb-1">GRH</p>
            <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
            <p className="text-xs text-gray-500">Gestion intelligente</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-white/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-5 space-y-2 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-[0.35em] px-1 mb-4">
            Pages
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link key={item.path} to={item.path} onClick={onClose} className="block">
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-200 border relative ${
                    active
                      ? 'bg-gradient-to-r from-primary-500/15 to-primary-600/15 text-primary-700 font-semibold shadow-lg border-primary-200/70'
                      : 'text-gray-700 hover:bg-gray-100/70 border-transparent'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-primary-600 rounded-r-full"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-primary-600' : 'text-gray-500'}`} />
                  <span className="flex-1 text-sm">{item.label}</span>
                  {active && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-primary-600 rounded-full shadow-sm"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-5 border-t border-white/60 bg-white/60 backdrop-blur-xl text-center">
          <p className="text-xs text-gray-500">GRH System v1.0</p>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
