'use client';

import { forwardRef } from 'react';
import { clsx } from 'clsx';

const Input = forwardRef(({ 
  type = 'text',
  label,
  error,
  helperText,
  className = '',
  inputClassName = '',
  disabled = false,
  required = false,
  ...props 
}, ref) => {
  const baseInputStyles = 'w-full px-4 py-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed';
  
  const inputStyles = error
    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
    : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 dark:text-white';

  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        disabled={disabled}
        required={required}
        className={clsx(baseInputStyles, inputStyles, inputClassName)}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
export default Input;
