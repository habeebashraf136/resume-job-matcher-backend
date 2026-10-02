import React from 'react';
import { cn } from '../../lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full relative">
        <input
          className={cn(
            "flex h-12 w-full rounded-pill border-2 border-ink bg-white text-[#111111] caret-[#111111] px-4 py-2 text-sm font-medium transition-all placeholder:text-[#666666]",
            "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:ring-yellow disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-danger shadow-[4px_4px_0_var(--danger)] focus-visible:ring-danger",
            !error && "neo-shadow-sm focus-visible:shadow-[4px_4px_0_var(--shadow-color)]",
            className
          )}
          ref={ref}
          {...props}
        />
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-1 bg-danger text-ink font-bold text-sm px-3 py-1 neo-border rounded-neo shadow-[3px_3px_0_var(--ink)] w-max"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);
Input.displayName = "Input";
