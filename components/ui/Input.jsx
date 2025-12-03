'use client';

import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { Search, X, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

// ============================================
// INPUT COMPONENT
// ============================================

const Input = forwardRef(
  (
    {
      className,
      type = 'text',
      error,
      label,
      hint,
      leftIcon,
      rightIcon,
      onClear,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={clsx(
              'w-full px-4 py-2.5 rounded-lg',
              'bg-white dark:bg-gray-900',
              'border text-gray-900 dark:text-gray-100',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:border-transparent',
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-700 focus:ring-brand-500',
              leftIcon && 'pl-10',
              (rightIcon || onClear) && 'pr-10',
              className
            )}
            {...props}
          />
          {(rightIcon || onClear) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {onClear && props.value ? (
                <button
                  type="button"
                  onClick={onClear}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                rightIcon && <span className="text-gray-400">{rightIcon}</span>
              )}
            </div>
          )}
        </div>
        {(error || hint) && (
          <p
            className={clsx(
              'mt-1.5 text-sm',
              error ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ============================================
// SEARCH INPUT
// ============================================

const SearchInput = forwardRef(
  ({ className, onClear, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="search"
        leftIcon={<Search className="w-5 h-5" />}
        onClear={onClear}
        className={className}
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';

// ============================================
// PASSWORD INPUT
// ============================================

const PasswordInput = forwardRef(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={clsx('pr-10', className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

// ============================================
// TEXTAREA
// ============================================

const Textarea = forwardRef(
  ({ className, error, label, hint, rows = 4, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={clsx(
            'w-full px-4 py-3 rounded-lg',
            'bg-white dark:bg-gray-900',
            'border text-gray-900 dark:text-gray-100',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:border-transparent',
            'resize-none',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-700 focus:ring-brand-500',
            className
          )}
          {...props}
        />
        {(error || hint) && (
          <p
            className={clsx(
              'mt-1.5 text-sm',
              error ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// ============================================
// SELECT
// ============================================

const Select = forwardRef(
  ({ className, error, label, hint, options = [], placeholder, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={clsx(
            'w-full px-4 py-2.5 rounded-lg',
            'bg-white dark:bg-gray-900',
            'border text-gray-900 dark:text-gray-100',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:border-transparent',
            'cursor-pointer',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-700 focus:ring-brand-500',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {(error || hint) && (
          <p
            className={clsx(
              'mt-1.5 text-sm',
              error ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// ============================================
// CHECKBOX
// ============================================

const Checkbox = forwardRef(
  ({ className, label, error, ...props }, ref) => {
    return (
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          ref={ref}
          type="checkbox"
          className={clsx(
            'w-5 h-5 rounded',
            'border-gray-300 dark:border-gray-600',
            'text-brand-600 focus:ring-brand-500',
            'transition-colors cursor-pointer',
            className
          )}
          {...props}
        />
        {label && (
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {label}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Input, SearchInput, PasswordInput, Textarea, Select, Checkbox };
