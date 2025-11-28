import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Drawer = ({ isOpen, onClose, title, children, side = 'right' }) => {
  const sideClasses = {
    right: 'right-0',
    left: 'left-0',
  };

  const slideVariants = {
    right: { x: '100%' },
    left: { x: '-100%' },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: side === 'right' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={slideVariants[side]}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 ${sideClasses[side]} h-full w-full max-w-md bg-[var(--surface)] text-[var(--text-primary)] shadow-[0_12px_28px_rgba(15,23,42,0.18)] border border-[var(--border-muted)] z-50 flex flex-col`}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between p-6 border-b border-[var(--border-muted)] bg-[var(--surface-strong)]/70">
                <h2 className="text-xl font-semibold">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-[var(--text-subtle)] hover:bg-[var(--primary-soft)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Drawer;
