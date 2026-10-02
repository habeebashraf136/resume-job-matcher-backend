import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
}

export function Card({ className, interactive = true, children, ...props }: CardProps) {
  return (
    <div
      className={cn("bg-surface neo-border neo-shadow rounded-neo p-6 relative overflow-hidden", className)}
      {...props}
    >
      {children}
    </div>
  );
}
