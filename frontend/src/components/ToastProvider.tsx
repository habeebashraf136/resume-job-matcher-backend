import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore } from '../hooks/useToast';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';

export function ToastProvider() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "flex items-center gap-3 p-4 min-w-[300px] neo-border rounded-neo neo-shadow-sm",
              {
                "bg-cyan text-ink": toast.type === 'info',
                "bg-danger text-ink": toast.type === 'error',
                "bg-success text-ink": toast.type === 'success',
                "bg-yellow text-ink": toast.type === 'warning',
              }
            )}
          >
            <div className="flex-shrink-0">
              {toast.type === 'info' && <Info className="h-5 w-5 text-ink" />}
              {toast.type === 'error' && <XCircle className="h-5 w-5 text-ink" />}
              {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-ink" />}
              {toast.type === 'warning' && <AlertCircle className="h-5 w-5 text-ink" />}
            </div>
            <p className="text-sm font-bold flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="opacity-70 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded-sm"
            >
              <X className="h-5 w-5 text-ink" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
