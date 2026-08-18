import { forwardRef } from 'react';
import { HiOutlineArrowPath } from 'react-icons/hi2';

const variantStyles = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-400',
  secondary:
    'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400',
  success:
    'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-green-400',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 disabled:text-gray-400',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    children,
    loading = false,
    disabled = false,
    onClick,
    type = 'button',
    icon: Icon,
    className = '',
    ...rest
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={[
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer',
        variantStyles[variant] || variantStyles.primary,
        sizeStyles[size] || sizeStyles.md,
        isDisabled ? 'opacity-60 cursor-not-allowed' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {loading ? (
        <HiOutlineArrowPath className="animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="shrink-0" />
      ) : null}
      {children}
    </button>
  );
});

export default Button;
