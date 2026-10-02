import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'accent' | 'warning' | 'success' | 'danger';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-3 py-1 text-xs font-bold text-ink neo-border bg-surface",
        {
          "bg-purple": variant === 'default',
          "bg-surface": variant === 'outline',
          "bg-cyan": variant === 'accent',
          "bg-yellow": variant === 'warning',
          "bg-success": variant === 'success',
          "bg-danger": variant === 'danger',
        },
        className
      )}
      {...props}
    />
  );
}
