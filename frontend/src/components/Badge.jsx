const variantStyles = {
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
  primary: 'bg-blue-50 text-blue-700 border-blue-200',
};

function Badge({ variant = 'gray', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant] || variantStyles.gray} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
