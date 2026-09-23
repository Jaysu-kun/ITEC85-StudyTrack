import { useState, useEffect, useCallback, useMemo } from 'react';
import { Task } from '../types';
import { isDueWithin24Hours, isTaskOverdue, getTimeRemainingText } from '../utils/date';
import useToast from '../store/useToast';

interface UseDeadlineNotifierProps {
  tasks: Task[];
  userId?: string;
  enableToasts?: boolean;
}

const STORAGE_SESSION_NOTIFIED_KEY = 'iskotasks_notified_task_ids';
const STORAGE_BANNER_DISMISSED_KEY = 'iskotasks_deadline_banner_dismissed';

export function useDeadlineNotifier({
  tasks,
  userId,
  enableToasts = true,
}: UseDeadlineNotifierProps) {
  const { showToast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'denied';
  });

  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(STORAGE_BANNER_DISMISSED_KEY) === 'true';
  });

  const isBrowserNotificationSupported = typeof window !== 'undefined' && 'Notification' in window;

  // Filter tasks specific to this user if userId is provided
  const userTasks = useMemo(() => {
    if (!userId) return tasks;
    return tasks.filter((t) => t.userId === userId || !t.userId);
  }, [tasks, userId]);

  // Tasks due in < 24 hours, sorted ascending by deadline
  const urgentTasks = useMemo(() => {
    return userTasks
      .filter((task) => isDueWithin24Hours(task.deadline, task.completed))
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [userTasks]);

  // Overdue tasks
  const overdueTasks = useMemo(() => {
    return userTasks
      .filter((task) => isTaskOverdue(task.deadline, task.completed))
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [userTasks]);

  const totalAlertsCount = urgentTasks.length + overdueTasks.length;

  // Request browser permission
  const requestPermission = useCallback(async () => {
    if (!isBrowserNotificationSupported) {
      showToast('Browser notifications are not supported on this browser.', 'warning');
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        showToast('Desktop notifications enabled successfully!', 'success');
        // Trigger a test/welcome notification
        try {
          new Notification('IskoTasks Notifications Enabled 🔔', {
            body: 'You will receive reminders when tasks are due within 24 hours.',
            icon: '/favicon.ico',
          });
        } catch (e) {
          console.warn('Could not launch initial notification:', e);
        }
      } else if (result === 'denied') {
        showToast('Notification permission was blocked in browser settings.', 'warning');
      }
      return result;
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return 'denied';
    }
  }, [isBrowserNotificationSupported, showToast]);

  // Dismiss dashboard alert banner for this session
  const dismissBanner = useCallback(() => {
    setIsBannerDismissed(true);
    sessionStorage.setItem(STORAGE_BANNER_DISMISSED_KEY, 'true');
  }, []);

  // Send desktop notification for a specific task
  const sendDesktopNotification = useCallback((task: Task, remainingStr: string) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
      const notif = new Notification('⏰ IskoTasks: Deadline Approaching!', {
        body: `"${task.title}" is ${remainingStr}. Finish it up!`,
        icon: '/favicon.ico',
        tag: `deadline-${task.id}`,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (err) {
      console.warn('Could not trigger Notification:', err);
    }
  }, []);

  // Check and trigger notifications for urgent tasks
  const checkAndNotifyUrgentTasks = useCallback(() => {
    if (urgentTasks.length === 0) return;

    let notifiedIds: string[] = [];
    try {
      const stored = sessionStorage.getItem(STORAGE_SESSION_NOTIFIED_KEY);
      if (stored) notifiedIds = JSON.parse(stored);
    } catch {
      notifiedIds = [];
    }

    const newlyUrgentTasks = urgentTasks.filter((t) => !notifiedIds.includes(t.id));

    if (newlyUrgentTasks.length > 0) {
      const updatedIds = [...notifiedIds, ...newlyUrgentTasks.map((t) => t.id)];
      sessionStorage.setItem(STORAGE_SESSION_NOTIFIED_KEY, JSON.stringify(updatedIds));

      // Trigger desktop notifications if permission granted
      if (permission === 'granted') {
        newlyUrgentTasks.forEach((task) => {
          const remainingText = getTimeRemainingText(task.deadline);
          sendDesktopNotification(task, remainingText);
        });
      }

      // Trigger in-app toast notification
      if (enableToasts) {
        if (newlyUrgentTasks.length === 1) {
          const singleTask = newlyUrgentTasks[0];
          const remaining = getTimeRemainingText(singleTask.deadline);
          showToast(`⏰ "${singleTask.title}" is ${remaining}!`, 'warning', 6000);
        } else {
          showToast(
            `⚠️ You have ${newlyUrgentTasks.length} tasks due within 24 hours!`,
            'warning',
            6000
          );
        }
      }
    }
  }, [urgentTasks, permission, enableToasts, sendDesktopNotification, showToast]);

  // Run check on mount/tasks change and every 2 minutes
  useEffect(() => {
    checkAndNotifyUrgentTasks();

    const interval = setInterval(() => {
      checkAndNotifyUrgentTasks();
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(interval);
  }, [checkAndNotifyUrgentTasks]);

  return {
    urgentTasks,
    overdueTasks,
    totalAlertsCount,
    permission,
    isBrowserNotificationSupported,
    requestPermission,
    isBannerDismissed,
    dismissBanner,
  };
}

export default useDeadlineNotifier;
