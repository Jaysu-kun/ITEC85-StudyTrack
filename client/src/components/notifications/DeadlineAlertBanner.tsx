import React from 'react';
import { Clock, X, ArrowRight, BellRing } from 'lucide-react';
import { Task } from '../../types';
import { getTimeRemainingText } from '../../utils/date';

interface DeadlineAlertBannerProps {
  urgentTasks: Task[];
  onDismiss: () => void;
  onViewTasks?: () => void;
}

export const DeadlineAlertBanner: React.FC<DeadlineAlertBannerProps> = ({
  urgentTasks,
  onDismiss,
  onViewTasks,
}) => {
  if (!urgentTasks || urgentTasks.length === 0) return null;

  const count = urgentTasks.length;
  const primaryTask = urgentTasks[0];
  const primaryRemaining = getTimeRemainingText(primaryTask.deadline);

  return (
    <div
      role="alert"
      className="mb-6 sm:mb-8 relative overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-300/80 dark:border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-transparent backdrop-blur-md p-4 sm:p-6 shadow-xs animate-in fade-in slide-in-from-top-3 duration-300"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 sm:gap-4">
        {/* Left Icon + Text */}
        <div className="flex items-start gap-2.5 sm:gap-3.5 flex-1 min-w-0">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-500/20 dark:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-300/60 dark:border-amber-600/30 flex-shrink-0 mt-0.5 sm:mt-0">
            <BellRing size={20} className="animate-pulse text-amber-600 dark:text-amber-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-amber-500 text-white shadow-xs flex-shrink-0">
                <Clock size={11} />
                <span>Due &lt; 24h</span>
              </span>
              <h2 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 dark:text-white tracking-tight break-words">
                {count === 1
                  ? `Task "${primaryTask.title}" is ${primaryRemaining}!`
                  : `You have ${count} tasks due within 24 hours!`}
              </h2>
            </div>

            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words">
              {count === 1 ? (
                <>
                  Upcoming deadline:{' '}
                  <strong className="text-amber-700 dark:text-amber-300 font-semibold">
                    {primaryRemaining}
                  </strong>
                  . Ensure your submission or review is completed on time.
                </>
              ) : (
                <>
                  Earliest deadline:{' '}
                  <strong className="text-amber-700 dark:text-amber-300 font-semibold">
                    "{primaryTask.title}" ({primaryRemaining})
                  </strong>
                  . Don't let your tasks fall overdue!
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action & Dismiss */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-shrink-0 pt-1 sm:pt-0">
          {onViewTasks && (
            <button
              onClick={onViewTasks}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-500 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <span>Review Tasks</span>
              <ArrowRight size={13} />
            </button>
          )}

          <button
            onClick={onDismiss}
            aria-label="Dismiss deadline alert"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-amber-500/10 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={17} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeadlineAlertBanner;
