import { motion } from 'framer-motion';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_6px_18px_rgba(15,23,42,0.08)]';

  const variants = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700 shadow-[0_10px_22px_rgba(126,34,206,0.25)] hover:-translate-y-0.5',
    secondary: 'bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border-muted)] hover:border-[var(--border-strong)] hover:-translate-y-0.5 shadow-[0_4px_12px_rgba(15,23,42,0.06)]',
    outline: 'border border-[var(--border-muted)] text-[var(--text-primary)] bg-transparent hover:bg-[var(--primary-soft)]',
    danger: 'bg-danger-600 text-white hover:bg-danger-500 shadow-[0_14px_30px_rgba(239,68,68,0.25)]',
    ghost: 'bg-[var(--primary-soft)] text-[var(--primary-strong)] hover:-translate-y-0.5',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
