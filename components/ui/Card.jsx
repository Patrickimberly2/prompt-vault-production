'use client';

import { forwardRef } from 'react';
import { clsx } from 'clsx';
import Link from 'next/link';

// ============================================
// CARD COMPONENT
// Glass morphism + Linear-style design
// ============================================

const Card = forwardRef(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      hover = false,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: [
        'bg-white dark:bg-gray-900',
        'border border-gray-200 dark:border-gray-800',
        'shadow-sm',
      ],
      elevated: [
        'bg-white dark:bg-gray-900',
        'border border-gray-200 dark:border-gray-800',
        'shadow-md',
      ],
      glass: [
        'backdrop-blur-md bg-white/70 dark:bg-gray-900/70',
        'border border-white/20 dark:border-gray-800/50',
        'shadow-glass',
      ],
      outline: [
        'bg-transparent',
        'border-2 border-gray-200 dark:border-gray-800',
      ],
      gradient: [
        'bg-gradient-to-br from-brand-50 to-accent-50',
        'dark:from-brand-950/50 dark:to-accent-950/50',
        'border border-brand-100 dark:border-brand-900/50',
      ],
    };

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6',
      xl: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={clsx(
          'rounded-xl',
          variants[variant],
          paddings[padding],
          hover && [
            'cursor-pointer',
            'hover:border-gray-300 dark:hover:border-gray-700',
            'hover:shadow-md',
            'hover:-translate-y-0.5',
            'transition-all duration-200',
          ],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// ============================================
// CARD HEADER
// ============================================

function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={clsx('flex items-start justify-between gap-4 mb-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================
// CARD TITLE
// ============================================

function CardTitle({ className, as: Component = 'h3', children, ...props }) {
  return (
    <Component
      className={clsx(
        'font-semibold text-gray-900 dark:text-gray-100',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

// ============================================
// CARD DESCRIPTION
// ============================================

function CardDescription({ className, children, ...props }) {
  return (
    <p
      className={clsx('text-sm text-gray-600 dark:text-gray-400', className)}
      {...props}
    >
      {children}
    </p>
  );
}

// ============================================
// CARD CONTENT
// ============================================

function CardContent({ className, children, ...props }) {
  return (
    <div className={clsx('', className)} {...props}>
      {children}
    </div>
  );
}

// ============================================
// CARD FOOTER
// ============================================

function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={clsx(
        'flex items-center gap-4 mt-4 pt-4',
        'border-t border-gray-100 dark:border-gray-800',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================
// LINKED CARD (for navigation)
// ============================================

const LinkedCard = forwardRef(
  ({ href, className, children, ...props }, ref) => {
    return (
      <Link href={href} className="block">
        <Card ref={ref} hover className={className} {...props}>
          {children}
        </Card>
      </Link>
    );
  }
);

LinkedCard.displayName = 'LinkedCard';

// ============================================
// FEATURE CARD (for landing pages)
// ============================================

function FeatureCard({ icon, title, description, className }) {
  return (
    <Card className={clsx('text-center', className)} padding="lg">
      {icon && (
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 mb-4">
          {icon}
        </div>
      )}
      <CardTitle className="text-lg mb-2">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </Card>
  );
}

// ============================================
// STAT CARD (for dashboards)
// ============================================

function StatCard({ label, value, change, icon, className }) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card className={className} padding="md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
          {change !== undefined && (
            <p
              className={clsx(
                'text-sm mt-1',
                isPositive && 'text-green-600',
                isNegative && 'text-red-600',
                !isPositive && !isNegative && 'text-gray-500'
              )}
            >
              {isPositive && '+'}
              {change}%
            </p>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  LinkedCard,
  FeatureCard,
  StatCard,
};
