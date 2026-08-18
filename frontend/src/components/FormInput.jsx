import { forwardRef } from 'react';

const FormInput = forwardRef(function FormInput(
  {
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    placeholder,
    required = false,
    disabled = false,
    className = '',
    ...rest
  },
  ref
) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={[
          'w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
          disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white',
        ].join(' ')}
        {...rest}
      />
      {error && (
        <p className="text-xs text-red-600 mt-0.5">{error}</p>
      )}
    </div>
  );
});

export default FormInput;
