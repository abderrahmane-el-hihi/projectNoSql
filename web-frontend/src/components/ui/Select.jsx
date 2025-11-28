const Select = ({
  label,
  error,
  className = '',
  children,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={`w-full px-4 py-2.5 border rounded-xl bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all shadow-[0_6px_20px_rgba(15,23,42,0.05)] ${
          error
            ? 'border-danger-500 focus:ring-danger-500/40'
            : 'border-[var(--border-muted)] hover:border-[var(--border-strong)]'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
};

export default Select;
