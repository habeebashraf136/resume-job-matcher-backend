import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export interface ButtonProps extends React.ComponentProps<typeof motion.button> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    // Respect prefers-reduced-motion by keeping Framer Motion for props passing, but we remove the manual scale animation.
    const MotionButton = motion.button as any;

    return (
      <MotionButton
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center font-bold transition-all duration-[120ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ink disabled:pointer-events-none disabled:opacity-50",
          {
            "neo-border rounded-neo neo-shadow-sm": variant !== 'ghost' && size !== 'icon',
            "bg-cyan text-btnText hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_var(--shadow-color)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none": variant === 'primary' && size !== 'icon',
            "bg-surface text-btnText hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_var(--shadow-color)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none": (variant === 'secondary' || variant === 'outline') && size !== 'icon',
            "bg-danger text-btnText hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_var(--shadow-color)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none": variant === 'danger' && size !== 'icon',
            "bg-transparent text-ink hover:underline decoration-2 underline-offset-4": variant === 'ghost',
            
            // Icon button logic
            "bg-purple text-ink neo-border rounded-circle neo-shadow-sm hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_var(--shadow-color)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none": size === 'icon',

            "h-9 px-4 text-sm": size === 'sm',
            "h-11 px-6 text-base": size === 'md',
            "h-14 px-8 text-lg": size === 'lg',
            "h-10 w-10 p-0": size === 'icon',
          },
          className
        )}
        {...props}
      >
        {isLoading && (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
        )}
        {children as any}
      </MotionButton>
    );
  }
);
Button.displayName = 'Button';
