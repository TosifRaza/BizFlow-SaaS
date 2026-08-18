import { forwardRef } from 'react';

const FormSelect = forwardRef(function FormSelect(
  {
    label,
    name,
    value,
    onChange,
    options = [],
    error,
    placeholder = 'Select an option',
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
      <select
        ref={ref}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={[
          'w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 transition-colors duration-150 appearance-none',
          'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27%236b7280%27%3E%3Cpath fill-rule=%27evenodd%27 d=%27M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z%27 clip-rule=%27evenodd%27/%3E%3C/svg%3E")] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
          !value ? 'text-gray-400' : '',
          disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white',
        ].join(' ')}
        {...rest}
      >
        <option value="" disabled>
          {placeholder}
        </option>
       {options.map((option) => (
  <option key={option.value} value={option.value}>
    {option.label}
  </option>
))}
      </select>
      {error && (
        <p className="text-xs text-red-600 mt-0.5">{error}</p>
      )}
    </div>
  );
});

export default FormSelect;
