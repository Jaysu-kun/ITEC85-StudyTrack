import { format, isToday, isTomorrow, differenceInDays } from 'date-fns';

/**
 * Formats a Date or date string into 'yyyy-MM-dd' using the user's local timezone.
 * Avoids UTC date shifting issues with toISOString().split('T')[0].
 */
export function formatLocalInputDate(dateVal?: string | Date): string {
  if (!dateVal) return format(new Date(), 'yyyy-MM-dd');
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return format(new Date(), 'yyyy-MM-dd');
  return format(d, 'yyyy-MM-dd');
}

/**
 * Formats a deadline into a user-friendly relative or calendar string.
 */
export function formatDeadline(dateStr: string | Date): string {
  const deadlineDate = new Date(dateStr);
  if (isNaN(deadlineDate.getTime())) return 'No due date';
  if (isToday(deadlineDate)) return 'Today';
  if (isTomorrow(deadlineDate)) return 'Tomorrow';

  const daysUntil = differenceInDays(deadlineDate, new Date());
  if (daysUntil > 0 && daysUntil < 7) return `In ${daysUntil} days`;
  if (daysUntil < 0) return `${Math.abs(daysUntil)} days overdue`;
  return format(deadlineDate, 'MMM d, yyyy');
}

/**
 * Determines whether a given deadline is overdue for an incomplete task.
 */
export function isTaskOverdue(dateStr: string | Date, completed = false): boolean {
  if (completed) return false;
  const deadlineDate = new Date(dateStr);
  if (isNaN(deadlineDate.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return deadlineDate < today;
}

/**
 * Formats a timestamp into a full localized date string (e.g., 'September 24, 2026').
 */
export function formatDisplayDate(dateStr: string | Date, fallback = 'Recent Member'): string {
  if (!dateStr) return fallback;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Checks if an incomplete task is due within the next 24 hours.
 */
export function isDueWithin24Hours(dateStr: string | Date, completed = false): boolean {
  if (completed) return false;
  const deadlineDate = new Date(dateStr);
  if (isNaN(deadlineDate.getTime())) return false;

  const now = Date.now();
  const diffMs = deadlineDate.getTime() - now;

  // Due in future and within 24 hours (24 * 60 * 60 * 1000 ms)
  return diffMs > 0 && diffMs <= 24 * 60 * 60 * 1000;
}

/**
 * Returns human-readable remaining time until deadline (e.g. 'in 3h 15m', 'in 45m', 'due now').
 */
export function getTimeRemainingText(dateStr: string | Date): string {
  const deadlineDate = new Date(dateStr);
  if (isNaN(deadlineDate.getTime())) return 'No due date';

  const diffMs = deadlineDate.getTime() - Date.now();
  if (diffMs <= 0) return 'Overdue';

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;

  if (hours === 0) {
    return mins <= 1 ? 'Due in < 1m' : `Due in ${mins}m`;
  }
  if (hours < 24) {
    return mins > 0 ? `Due in ${hours}h ${mins}m` : `Due in ${hours}h`;
  }

  const days = Math.floor(hours / 24);
  return `Due in ${days}d`;
}
