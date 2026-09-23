import React, { forwardRef, useId } from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      icon,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    const describedBy = error ? errorId : helperText ? helperId : undefined;

    const baseInputClasses =
      'w-full bg-white dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 rounded-xl transition-all duration-200 py-2.5 px-4 shadow-sm border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 dark:focus:ring-sky-400/30 dark:focus:border-sky-400 placeholder:text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:opacity-60 disabled:cursor-not-allowed';

    const errorClasses =
      'border-rose-500 dark:border-rose-500 focus:border-rose-500 focus:ring-rose-500/25 text-rose-900 dark:text-rose-100';

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            {label}
            {props.required && (
              <span className="ml-1 text-rose-500" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              {icon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={`${baseInputClasses} ${error ? errorClasses : ''} ${
              icon ? 'pl-10' : ''
            }`}
            {...props}
          />
        </div>

        {error && (
          <div
            id={errorId}
            className="flex items-center gap-1.5 mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium"
            role="alert"
          >
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!error && helperText && (
          <p
            id={helperId}
            className="mt-1.5 text-xs text-slate-500 dark:text-slate-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
