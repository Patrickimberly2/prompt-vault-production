'use client';

import { forwardRef } from 'react';
import { clsx } from 'clsx';

const Card = forwardRef(({ 
  children, 
  className = '',
  hover = false,
  padding = 'md',
  ...props 
}, ref) => {
  const baseStyles = 'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm';
  
  const hoverStyles = hover 
    ? 'transition-all duration-200 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600 cursor-pointer' 
    : '';

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      ref={ref}
      className={clsx(baseStyles, hoverStyles, paddingStyles[padding], className)}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

const CardHeader = forwardRef(({ children, className = '', ...props }, ref) => (
  <div 
    ref={ref} 
    className={clsx('mb-4', className)} 
    {...props}
  >
    {children}
  </div>
));

CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef(({ children, className = '', ...props }, ref) => (
  <h3 
    ref={ref} 
    className={clsx('text-lg font-semibold text-gray-900 dark:text-white', className)} 
    {...props}
  >
    {children}
  </h3>
));

CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef(({ children, className = '', ...props }, ref) => (
  <p 
    ref={ref} 
    className={clsx('text-sm text-gray-500 dark:text-gray-400 mt-1', className)} 
    {...props}
  >
    {children}
  </p>
));

CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef(({ children, className = '', ...props }, ref) => (
  <div 
    ref={ref} 
    className={clsx('', className)} 
    {...props}
  >
    {children}
  </div>
));

CardContent.displayName = 'CardContent';

const CardFooter = forwardRef(({ children, className = '', ...props }, ref) => (
  <div 
    ref={ref} 
    className={clsx('mt-4 pt-4 border-t border-gray-200 dark:border-gray-700', className)} 
    {...props}
  >
    {children}
  </div>
));

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export default Card;
