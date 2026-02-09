import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

const REMINDER_INTERVAL_KEY = 'hydration_reminder_interval';
const REMINDER_RUNNING_KEY = 'hydration_reminder_running';
const DEFAULT_INTERVAL_MINUTES = 60;

export function useReminderScheduler() {
  const [isRunning, setIsRunning] = useState(() => {
    const stored = localStorage.getItem(REMINDER_RUNNING_KEY);
    return stored === 'true';
  });
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showInAppReminder, setShowInAppReminder] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications are not supported in this browser');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Notifications enabled successfully');
      } else if (permission === 'denied') {
        toast.error('Notification permission denied. You can still use in-app reminders.');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to request notification permission');
    }
  }, []);

  const showReminder = useCallback(() => {
    if (notificationPermission === 'granted') {
      try {
        new Notification('Time to Hydrate! 💧', {
          body: 'Remember to drink some water to stay healthy and hydrated.',
          icon: '/assets/generated/app-icon.dim_512x512.png',
          badge: '/assets/generated/app-icon.dim_512x512.png',
          tag: 'hydration-reminder',
          requireInteraction: false,
        });
      } catch (error) {
        console.error('Error showing notification:', error);
        setShowInAppReminder(true);
      }
    } else {
      setShowInAppReminder(true);
    }
  }, [notificationPermission]);

  const dismissReminder = useCallback(() => {
    setShowInAppReminder(false);
  }, []);

  const startReminders = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const intervalMinutes = parseInt(localStorage.getItem(REMINDER_INTERVAL_KEY) || String(DEFAULT_INTERVAL_MINUTES));
    const intervalMs = intervalMinutes * 60 * 1000;

    intervalRef.current = setInterval(() => {
      showReminder();
    }, intervalMs);

    setIsRunning(true);
    localStorage.setItem(REMINDER_RUNNING_KEY, 'true');
    toast.success('Reminders started');
  }, [showReminder]);

  const pauseReminders = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsRunning(false);
    localStorage.setItem(REMINDER_RUNNING_KEY, 'false');
    toast.info('Reminders paused');
  }, []);

  // Auto-start reminders if they were running before
  useEffect(() => {
    if (isRunning) {
      startReminders();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Auto-dismiss in-app reminder after 10 seconds
  useEffect(() => {
    if (showInAppReminder) {
      const timeout = setTimeout(() => {
        setShowInAppReminder(false);
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [showInAppReminder]);

  return {
    isRunning,
    notificationPermission,
    showInAppReminder,
    requestPermission,
    startReminders,
    pauseReminders,
    dismissReminder,
  };
}
