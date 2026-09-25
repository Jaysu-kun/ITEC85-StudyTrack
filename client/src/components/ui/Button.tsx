import React from 'react';
import { motion } from 'framer-motion';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'gradient'
  | 'outline'
  | 'ghost'
  | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  type = 'button',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500 dark:focus-visible:ring-offset-slate-900 rounded-xl cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 select-none';

  const variantClasses: Record<ButtonVariant, string> = {
    gradient:
      'bg-gradient-to-r from-[#0284c7] to-[#027BF9] dark:from-[#38BDF8] dark:to-[#027BF9] text-white shadow-sm hover:shadow-md hover:brightness-105 active:brightness-95 border-none',
    primary:
      'bg-sky-600 dark:bg-sky-500 text-white hover:bg-sky-700 dark:hover:bg-sky-600 shadow-sm hover:shadow',
    secondary:
      'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/60',
    outline:
      'border border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800',
    ghost:
      'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700 shadow-sm',
  };

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'text-xs px-2.5 sm:px-3 py-1.5 gap-1.5 rounded-lg min-h-[36px]',
    md: 'text-xs sm:text-sm px-3.5 sm:px-4 py-2 gap-2 rounded-xl min-h-[40px] sm:min-h-[42px]',
    lg: 'text-sm sm:text-base px-5 sm:px-6 py-2.5 sm:py-3 gap-2.5 rounded-xl min-h-[46px] sm:min-h-[48px]',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : icon ? (
        <span className="inline-flex items-center">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  );
};

export default Button;
