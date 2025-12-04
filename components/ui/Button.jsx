'use client';

import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

// ============================================
// BUTTON COMPONENT
// Linear/Vercel-inspired design
// ============================================

const buttonVariants = {
  variant: {
    primary: [
      'bg-brand-600 text-white',
      'hover:bg-brand-700 active:bg-brand-800',
      'focus:ring-brand-500',
      'shadow-sm hover:shadow',
    ],
    secondary: [
      'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
      'hover:bg-gray-200 dark:hover:bg-gray-700',
      'focus:ring-gray-500',
      'border border-gray-200 dark:border-gray-700',
    ],
    ghost: [
      'bg-transparent text-gray-700 dark:text-gray-300',
      'hover:bg-gray-100 dark:hover:bg-gray-800',
      'focus:ring-gray-500',
    ],
    danger: [
      'bg-red-600 text-white',
      'hover:bg-red-700 active:bg-red-800',
      'focus:ring-red-500',
    ],
    gradient: [
      'bg-gradient-to-r from-brand-600 to-accent-600 text-white',
      'hover:from-brand-700 hover:to-accent-700',
      'focus:ring-brand-500',
      'shadow-sm hover:shadow',
    ],
    outline: [
      'bg-transparent border-2 border-brand-600 text-brand-600',
      'hover:bg-brand-50 dark:hover:bg-brand-950',
      'focus:ring-brand-500',
    ],
    link: [
      'bg-transparent text-brand-600 dark:text-brand-400',
      'hover:text-brand-700 dark:hover:text-brand-300',
      'underline-offset-4 hover:underline',
      'p-0 h-auto',
    ],
  },
  size: {
    xs: 'px-2.5 py-1 text-xs rounded',
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2.5 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-lg',
    xl: 'px-8 py-4 text-lg rounded-xl',
    icon: 'p-2 rounded-lg',
    'icon-sm': 'p-1.5 rounded-md',
    'icon-lg': 'p-3 rounded-lg',
  },
};

const Button = forwardRef(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      asChild = false,
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;

    return (
      <Comp
        ref={ref}
        disabled={isDisabled}
        className={clsx(
          // Base styles
          'inline-flex items-center justify-center gap-2',
          'font-medium',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'dark:focus:ring-offset-gray-900',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Variant styles
          buttonVariants.variant[variant],
          // Size styles
          buttonVariants.size[size],
          className
        )}
        {...props}
      >
        {loading && (
          <Loader2 className="w-4 h-4 animate-spin" />
        )}
        {!loading && leftIcon && (
          <span className="flex-shrink-0">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

// ============================================
// ICON BUTTON (for standalone icon buttons)
// ============================================
const IconButton = forwardRef(
  (
    {
      className,
      variant = 'ghost',
      size = 'icon',
      loading = false,
      disabled = false,
      'aria-label': ariaLabel,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        loading={loading}
        disabled={disabled}
        aria-label={ariaLabel}
        className={className}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

// ============================================
// BUTTON GROUP
// ============================================
function ButtonGroup({ children, className, ...props }) {
  return (
    <div
      className={clsx(
        'inline-flex items-center',
        '[&>button]:rounded-none',
        '[&>button:first-child]:rounded-l-lg',
        '[&>button:last-child]:rounded-r-lg',
        '[&>button:not(:first-child)]:-ml-px',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Button, IconButton, ButtonGroup };
