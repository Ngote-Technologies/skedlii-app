import React from 'react';
import { cn } from '../../lib/utils';

interface NotificationBadgeProps {
  count: number;
  className?: string;
  variant?: 'dot' | 'count' | 'text-only';
  maxCount?: number;
  showZero?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  className,
  variant = 'count',
  maxCount = 99,
  showZero = false,
  size = 'md',
}) => {
  // Don't render if count is 0 and showZero is false
  if (count === 0 && !showZero) {
    return null;
  }

  const sizeClasses = {
    sm: 'min-w-[14px] h-[14px] text-[10px]',
    md: 'min-w-[18px] h-[18px] text-xs',
    lg: 'min-w-[22px] h-[22px] text-sm',
  };

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  if (variant === 'dot') {
    return (
      <span 
        className={cn(
          'absolute w-2 h-2 bg-red-500 rounded-full',
          '-top-0.5 -right-0.5',
          className
        )}
        aria-label={`${count} notifications`}
      />
    );
  }

  if (variant === 'text-only') {
    return (
      <span 
        className={cn(
          'font-bold text-red-500 dark:text-red-400',
          size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs',
          className
        )}
        aria-label={`${count} notifications`}
      >
        {displayCount}
      </span>
    );
  }

  // Default 'count' variant
  return (
    <span 
      className={cn(
        'absolute flex items-center justify-center font-bold text-red-500 dark:text-red-400 bg-transparent',
        sizeClasses[size],
        '-top-0.5 -right-0.5',
        className
      )}
      aria-label={`${count} notifications`}
    >
      {displayCount}
    </span>
  );
};

export default NotificationBadge;