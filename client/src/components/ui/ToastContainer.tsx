import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import useToast from '../../store/useToast';
import { ToastType } from '../../types';

const toastStyles: Record<
  ToastType,
  { bg: string; border: string; text: string; icon: React.ReactNode }
> = {
  success: {
    bg: 'bg-white/95 dark:bg-slate-900/95',
    border: 'border-emerald-500/40 dark:border-emerald-500/50 shadow-emerald-500/10',
    text: 'text-slate-900 dark:text-slate-100',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />,
  },
  add: {
    bg: 'bg-white/95 dark:bg-slate-900/95',
    border: 'border-sky-500/40 dark:border-sky-500/50 shadow-sky-500/10',
    text: 'text-slate-900 dark:text-slate-100',
    icon: <CheckCircle2 className="w-5 h-5 text-sky-600 dark:text-sky-400 flex-shrink-0" />,
  },
  edit: {
    bg: 'bg-white/95 dark:bg-slate-900/95',
    border: 'border-amber-500/40 dark:border-amber-500/50 shadow-amber-500/10',
    text: 'text-slate-900 dark:text-slate-100',
    icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />,
  },
  delete: {
    bg: 'bg-white/95 dark:bg-slate-900/95',
    border: 'border-rose-500/40 dark:border-rose-500/50 shadow-rose-500/10',
    text: 'text-slate-900 dark:text-slate-100',
    icon: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />,
  },
  error: {
    bg: 'bg-white/95 dark:bg-slate-900/95',
    border: 'border-rose-500/50 dark:border-rose-500/60 shadow-rose-500/10',
    text: 'text-slate-900 dark:text-slate-100',
    icon: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />,
  },
  warning: {
    bg: 'bg-white/95 dark:bg-slate-900/95',
    border: 'border-amber-500/40 dark:border-amber-500/50 shadow-amber-500/10',
    text: 'text-slate-900 dark:text-slate-100',
    icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />,
  },
  info: {
    bg: 'bg-white/95 dark:bg-slate-900/95',
    border: 'border-sky-500/40 dark:border-sky-500/50 shadow-sky-500/10',
    text: 'text-slate-900 dark:text-slate-100',
    icon: <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 flex-shrink-0" />,
  },
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-20 right-4 sm:right-6 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const style = toastStyles[toast.type] || toastStyles.info;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ duration: 0.22 }}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-xl ${style.bg} ${style.border} ${style.text}`}
              role="alert"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {style.icon}
                <p className="text-sm font-medium leading-snug break-words">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close notification"
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
