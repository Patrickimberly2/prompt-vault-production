'use client';

import { clsx } from 'clsx';

// ============================================
// BADGE COMPONENT
// ============================================

const badgeVariants = {
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  primary: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
  secondary: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  accent: 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400',
  outline: 'bg-transparent border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
};

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

function Badge({
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
  children,
  ...props
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full',
            variant === 'success' && 'bg-green-500',
            variant === 'warning' && 'bg-amber-500',
            variant === 'error' && 'bg-red-500',
            variant === 'primary' && 'bg-brand-500',
            variant === 'accent' && 'bg-accent-500',
            (variant === 'default' || variant === 'secondary') && 'bg-gray-500'
          )}
        />
      )}
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-0.5 -mr-1 hover:opacity-70 transition-opacity"
          aria-label="Remove"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
}

// ============================================
// AVATAR COMPONENT
// ============================================

const avatarSizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-20 h-20 text-2xl',
};

function Avatar({
  src,
  alt = '',
  fallback,
  size = 'md',
  className,
  ...props
}) {
  const initials = fallback || alt.slice(0, 2).toUpperCase();

  return (
    <div
      className={clsx(
        'relative inline-flex items-center justify-center',
        'rounded-full overflow-hidden',
        'bg-gray-200 dark:bg-gray-800',
        'text-gray-600 dark:text-gray-400 font-medium',
        avatarSizes[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

// ============================================
// AVATAR GROUP
// ============================================

function AvatarGroup({ avatars, max = 4, size = 'md', className }) {
  const displayed = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className={clsx('flex -space-x-2', className)}>
      {displayed.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          alt={avatar.alt}
          fallback={avatar.fallback}
          size={size}
          className="ring-2 ring-white dark:ring-gray-900"
        />
      ))}
      {remaining > 0 && (
        <div
          className={clsx(
            'inline-flex items-center justify-center',
            'rounded-full',
            'bg-gray-200 dark:bg-gray-700',
            'text-gray-600 dark:text-gray-300 font-medium',
            'ring-2 ring-white dark:ring-gray-900',
            avatarSizes[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

// ============================================
// SKELETON COMPONENT
// ============================================

function Skeleton({ className, ...props }) {
  return (
    <div
      className={clsx(
        'bg-gray-200 dark:bg-gray-800 rounded animate-pulse',
        className
      )}
      {...props}
    />
  );
}

// ============================================
// DIVIDER COMPONENT
// ============================================

function Divider({ className, label, ...props }) {
  if (label) {
    return (
      <div className={clsx('flex items-center gap-4', className)} {...props}>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
      </div>
    );
  }

  return (
    <div
      className={clsx('h-px bg-gray-200 dark:bg-gray-800', className)}
      {...props}
    />
  );
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================

function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center py-12 px-4',
        className
      )}
    >
      {icon && (
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <span className="text-gray-400 dark:text-gray-500">{icon}</span>
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

// ============================================
// SPINNER / LOADING
// ============================================

function Spinner({ size = 'md', className }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <svg
      className={clsx('animate-spin text-brand-600', sizes[size], className)}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// ============================================
// LOADING OVERLAY
// ============================================

function LoadingOverlay({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
}

// ============================================
// TOOLTIP (simple CSS-based)
// ============================================

function Tooltip({ children, content, position = 'top' }) {
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative group inline-flex">
      {children}
      <div
        className={clsx(
          'absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded whitespace-nowrap',
          'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
          'transition-all duration-200',
          positions[position]
        )}
      >
        {content}
      </div>
    </div>
  );
}

export {
  Badge,
  Avatar,
  AvatarGroup,
  Skeleton,
  Divider,
  EmptyState,
  Spinner,
  LoadingOverlay,
  Tooltip,
};
