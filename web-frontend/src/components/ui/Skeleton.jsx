const Skeleton = ({ className = '', variant = 'default' }) => {
  const variants = {
    default: 'h-4 bg-gray-200 rounded',
    text: 'h-4 bg-gray-200 rounded w-3/4',
    title: 'h-6 bg-gray-200 rounded w-1/2',
    avatar: 'h-10 w-10 bg-gray-200 rounded-full',
    card: 'h-32 bg-gray-200 rounded-xl',
  };

  return (
    <div className={`animate-pulse ${variants[variant]} ${className}`} />
  );
};

export default Skeleton;

