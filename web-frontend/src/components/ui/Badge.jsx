import { motion } from 'framer-motion';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-[var(--surface-strong)] text-[var(--text-primary)] border-[var(--border-muted)]',
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-100 border-primary-200/60 dark:border-primary-400/30',
    success: 'bg-success-50 text-success-700 dark:bg-success-500/20 dark:text-success-50 border-success-500/20',
    warning: 'bg-warning-50 text-warning-600 dark:bg-warning-500/25 dark:text-warning-50 border-warning-500/25',
    danger: 'bg-danger-50 text-danger-600 dark:bg-danger-500/20 dark:text-danger-50 border-danger-500/25',
    info: 'bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-50 border-blue-500/25',
    secondary: 'bg-[var(--primary-soft)] text-[var(--text-primary)] border-[var(--border-muted)]',
  };

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </motion.span>
  );
};

export default Badge;
