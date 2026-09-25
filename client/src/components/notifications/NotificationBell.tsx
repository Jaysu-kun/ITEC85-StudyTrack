import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Clock,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useTaskStore from '../../store/useTaskStore';
import useDeadlineNotifier from '../../hooks/useDeadlineNotifier';
import { getTimeRemainingText, formatDeadline } from '../../utils/date';
import { Task } from '../../types';

interface NotificationBellProps {
  onSelectTask?: (task: Task) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onSelectTask }) => {
  const { user } = useAuthStore();
  const { tasks, toggleTaskCompletion, categories } = useTaskStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    urgentTasks,
    overdueTasks,
    totalAlertsCount,
    permission,
    isBrowserNotificationSupported,
    requestPermission,
  } = useDeadlineNotifier({ tasks, userId: user?.id, enableToasts: false });

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleTaskClick = (task: Task) => {
    setIsOpen(false);
    if (onSelectTask) {
      onSelectTask(task);
    } else {
      // Scroll to tasks section if on dashboard
      const taskElement = document.getElementById(`task-${task.id}`);
      if (taskElement) {
        taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const getCategoryColor = (subjectId: string) => {
    const cat = categories.find((c) => c.id === subjectId);
    return cat?.color || '#0284C7';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications (${totalAlertsCount} alerts)`}
        aria-expanded={isOpen}
        className={`relative p-2 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
          isOpen
            ? 'bg-sky-50 text-sky-600 dark:bg-slate-800 dark:text-sky-400'
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400'
        }`}
      >
        {totalAlertsCount > 0 ? (
          <BellRing
            size={19}
            className={`${
              urgentTasks.length > 0 ? 'text-amber-500 dark:text-amber-400 animate-pulse' : 'text-rose-500'
            }`}
          />
        ) : (
          <Bell size={19} />
        )}

        {/* Counter Badge */}
        {totalAlertsCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-in fade-in zoom-in duration-200">
            {totalAlertsCount > 9 ? '9+' : totalAlertsCount}
          </span>
        )}
      </button>

      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 sm:hidden bg-black/20 dark:bg-black/40 backdrop-blur-[1px]"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Deadline Alerts"
          className="fixed inset-x-3 top-16 max-w-md mx-auto sm:max-w-none sm:mx-0 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2.5 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="p-1.5 sm:p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex-shrink-0">
                <Clock size={16} />
              </span>
              <div className="min-w-0">
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  Deadline Reminders
                </h2>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {totalAlertsCount === 0
                    ? 'No urgent deadlines right now'
                    : `${totalAlertsCount} task${totalAlertsCount > 1 ? 's' : ''} requiring attention`}
                </p>
              </div>
            </div>

            {totalAlertsCount > 0 && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 flex-shrink-0">
                Action
              </span>
            )}
          </div>

          {/* Body List */}
          <div className="max-h-[min(360px,65vh)] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {totalAlertsCount === 0 ? (
              <div className="p-6 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle size={20} />
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  You are all caught up!
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  No upcoming deadlines in the next 24 hours.
                </p>
              </div>
            ) : (
              <>
                {/* Urgent Tasks (Due in < 24 hrs) */}
                {urgentTasks.length > 0 && (
                  <div className="p-2 sm:p-2.5">
                    <div className="px-2 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <Clock size={12} />
                      <span>Due Within 24 Hours ({urgentTasks.length})</span>
                    </div>

                    <div className="space-y-1.5 mt-1">
                      {urgentTasks.map((task) => {
                        const remaining = getTimeRemainingText(task.deadline);
                        const catColor = getCategoryColor(task.subject);

                        return (
                          <div
                            key={task.id}
                            className="group p-2.5 sm:p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20 transition-all flex items-start justify-between gap-2.5 cursor-pointer"
                            onClick={() => handleTaskClick(task)}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: catColor }}
                                />
                                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                                  {task.title}
                                </h3>
                              </div>

                              <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px]">
                                <span className="font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                                  <Clock size={11} />
                                  {remaining}
                                </span>
                                <span className="text-slate-400">•</span>
                                <span className="text-slate-500 dark:text-slate-400 capitalize">
                                  {task.priority} Priority
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskCompletion(task.id);
                              }}
                              title="Mark task completed"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors flex-shrink-0 cursor-pointer"
                            >
                              <CheckCircle size={17} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Overdue Tasks */}
                {overdueTasks.length > 0 && (
                  <div className="p-2 sm:p-2.5">
                    <div className="px-2 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle size={12} />
                      <span>Overdue Tasks ({overdueTasks.length})</span>
                    </div>

                    <div className="space-y-1.5 mt-1">
                      {overdueTasks.map((task) => (
                        <div
                          key={task.id}
                          className="group p-2.5 sm:p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 border border-rose-200/60 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/20 transition-all flex items-start justify-between gap-2.5 cursor-pointer"
                          onClick={() => handleTaskClick(task)}
                        >
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-rose-600 transition-colors">
                              {task.title}
                            </h3>
                            <div className="mt-1 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-rose-600 dark:text-rose-400 font-semibold truncate">
                              <span>Due: {formatDeadline(task.deadline)}</span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTaskCompletion(task.id);
                            }}
                            title="Mark task completed"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors flex-shrink-0 cursor-pointer"
                          >
                            <CheckCircle size={17} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Desktop Push Notification Permission Banner / Footer */}
          {isBrowserNotificationSupported && permission !== 'granted' && (
            <div className="p-3 bg-sky-50 dark:bg-sky-950/50 border-t border-sky-100 dark:border-sky-900/40">
              <div className="flex items-start gap-2">
                <ShieldAlert size={15} className="text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-sky-900 dark:text-sky-200">
                    Get Desktop Alerts
                  </p>
                  <p className="text-[10px] text-sky-700 dark:text-sky-300/80 leading-tight mt-0.5">
                    Receive browser popup alerts 24 hours before deadlines.
                  </p>
                  <button
                    onClick={requestPermission}
                    className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold bg-sky-600 hover:bg-sky-700 text-white transition-colors shadow-xs cursor-pointer"
                  >
                    <span>Enable Notifications</span>
                    <ExternalLink size={10} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
