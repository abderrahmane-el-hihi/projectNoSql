import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative rounded-3xl border border-[var(--border-muted)] bg-[var(--card-gradient)] text-[var(--text-primary)] shadow-[var(--shadow-soft)] backdrop-blur-xl p-6 overflow-hidden ${hover ? 'card-hover' : ''} ${className}`}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 blur-2xl bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.12),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(244,114,182,0.12),transparent_45%)]" />
      <div className="relative">
      {children}
      </div>
    </motion.div>
  );
};

export default Card;
