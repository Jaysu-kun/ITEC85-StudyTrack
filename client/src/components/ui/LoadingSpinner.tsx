import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label,
  className = '',
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <div
        className={`${sizeClasses[size]} border-sky-500 border-t-transparent rounded-full animate-spin`}
        aria-hidden="true"
      />
      {label && (
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {label}
        </span>
      )}
      <span className="sr-only">{label || 'Loading...'}</span>
    </div>
  );
};

export const PageLoadingFallback: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      <LoadingSpinner size="lg" label="Loading page content..." />
    </div>
  );
};

export default LoadingSpinner;
