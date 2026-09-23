import React from 'react';
import { motion } from 'framer-motion';

export type CardVariant = 'default' | 'glass' | 'elevated' | 'outline' | 'flat';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: CardVariant;
  onClick?: () => void;
  animate?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default:
    'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_25px_-4px_rgba(0,0,0,0.35)]',
  glass:
    'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.45)]',
  elevated:
    'bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-xl hover:shadow-2xl dark:shadow-[0_10px_35px_-5px_rgba(0,0,0,0.5)]',
  outline:
    'bg-slate-50/40 dark:bg-slate-900/40 border-2 border-dashed border-slate-300/80 dark:border-slate-700/80',
  flat:
    'bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/50',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  onClick,
  animate = false,
  ...props
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-200 text-slate-900 dark:text-slate-100';
  const combinedClasses = `${baseClasses} ${variantStyles[variant]} ${className}`;

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
        className={combinedClasses}
        onClick={onClick}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.div>)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={combinedClasses} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

export default Card;