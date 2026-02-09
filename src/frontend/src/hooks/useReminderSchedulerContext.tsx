import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { toast } from 'sonner';

const REMINDER_INTERVAL_KEY = 'hydration_reminder_interval';
const REMINDER_RUNNING_KEY = 'hydration_reminder_running';
const DEFAULT_INTERVAL_MINUTES = 60;

export type ReminderType = 'hydration' | 'sleep' | 'custom';

export interface FiredReminder {
  type: ReminderType;
  title: string;
  body: string;
  tag: string;
}

interface ReminderSchedulerContextType {
  isRunning: boolean;
  notificationPermission: NotificationPermission;
  showInAppReminder: FiredReminder | null;
  requestPermission: () => Promise<void>;
  startReminders: () => void;
  pauseReminders: () => void;
  dismissReminder: () => void;
}

const ReminderSchedulerContext = createContext<ReminderSchedulerContextType | undefined>(undefined);

export function ReminderSchedulerProvider({ children }: { children: ReactNode }) {
  const [isRunning, setIsRunning] = useState(() => {
    const stored = localStorage.getItem(REMINDER_RUNNING_KEY);
    return stored === 'true';
  });
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showInAppReminder, setShowInAppReminder] = useState<FiredReminder | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const showReminder = useCallback((reminder: FiredReminder) => {
    if (notificationPermission === 'granted') {
      try {
        new Notification(reminder.title, {
          body: reminder.body,
          icon: '/assets/generated/app-icon.dim_512x512.png',
          badge: '/assets/generated/app-icon.dim_512x512.png',
          tag: reminder.tag,
          requireInteraction: false,
        });
      } catch (error) {
        console.error('Error showing notification:', error);
        setShowInAppReminder(reminder);
      }
    } else {
      setShowInAppReminder(reminder);
    }
  }, [notificationPermission]);

  const dismissReminder = useCallback(() => {
    setShowInAppReminder(null);
  }, []);

  const startReminders = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const intervalMinutes = parseInt(localStorage.getItem(REMINDER_INTERVAL_KEY) || String(DEFAULT_INTERVAL_MINUTES));
    const intervalMs = intervalMinutes * 60 * 1000;

    intervalRef.current = setInterval(() => {
      showReminder({
        type: 'hydration',
        title: 'Time to Hydrate! 💧',
        body: 'Remember to drink some water to stay healthy and hydrated.',
        tag: 'hydration-reminder',
      });
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

  useEffect(() => {
    if (showInAppReminder) {
      const timeout = setTimeout(() => {
        setShowInAppReminder(null);
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [showInAppReminder]);

  return (
    <ReminderSchedulerContext.Provider
      value={{
        isRunning,
        notificationPermission,
        showInAppReminder,
        requestPermission,
        startReminders,
        pauseReminders,
        dismissReminder,
      }}
    >
      {children}
    </ReminderSchedulerContext.Provider>
  );
}

export function useReminderScheduler() {
  const context = useContext(ReminderSchedulerContext);
  if (context === undefined) {
    throw new Error('useReminderScheduler must be used within a ReminderSchedulerProvider');
  }
  return context;
}
