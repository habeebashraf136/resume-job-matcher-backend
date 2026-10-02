import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#000000]/60"
          />
          
          {/* Dialog content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "relative z-50 w-full max-w-lg overflow-hidden bg-surface neo-border neo-shadow-lg rounded-neo p-6",
              className
            )}
          >
            {title && (
              <div className="flex items-center justify-between mb-4 border-b-2 border-ink pb-2">
                <h2 className="text-xl font-display font-bold text-ink">{title}</h2>
                <button
                  onClick={onClose}
                  className="rounded-circle p-2 neo-border bg-yellow hover:bg-pink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                >
                  <X className="h-5 w-5 text-ink" />
                  <span className="sr-only">Close</span>
                </button>
              </div>
            )}
            {!title && (
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-circle p-2 neo-border bg-yellow hover:bg-pink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
              >
                <X className="h-5 w-5 text-ink" />
              </button>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
