import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { toast } from 'sonner';

const REMINDER_INTERVAL_KEY = 'hydration_reminder_interval';
const REMINDER_RUNNING_KEY = 'hydration_reminder_running';
const DEFAULT_INTERVAL_MINUTES = 60;

export type ReminderType = 'hydration' | 'sleep' | 'custom' | 'streak-break';

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
  fireReminder: (reminder: FiredReminder) => void;
}

const ReminderSchedulerContext = createContext<ReminderSchedulerContextType | undefined>(undefined);

// Gen-Z friendly hydration reminder templates
const HYDRATION_REMINDERS = [
  {
    title: "Hydration check! 💧",
    body: "Time to sip some water and keep those vibes high! ✨"
  },
  {
    title: "Water break! 🌊",
    body: "Your body's calling – grab that water bottle! 💙"
  },
  {
    title: "Stay hydrated, bestie! 💦",
    body: "Quick water break = instant glow up! You got this! ☀️"
  },
  {
    title: "Drink up! 🥤",
    body: "Hydration = good vibes only. Let's keep it going! 🔥"
  },
  {
    title: "Water time! 💧",
    body: "Your future self will thank you. Take a sip! 🙌"
  },
  {
    title: "Thirsty? 🌊",
    body: "Bet! Time to hydrate and feel amazing! ✨"
  },
];

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
        toast.success('Notifications enabled! 🎉');
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

  const fireReminder = useCallback((reminder: FiredReminder) => {
    showReminder(reminder);
  }, [showReminder]);

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
      // Randomly select a reminder template
      const randomReminder = HYDRATION_REMINDERS[Math.floor(Math.random() * HYDRATION_REMINDERS.length)];
      
      showReminder({
        type: 'hydration',
        title: randomReminder.title,
        body: randomReminder.body,
        tag: 'hydration-reminder',
      });
    }, intervalMs);

    setIsRunning(true);
    localStorage.setItem(REMINDER_RUNNING_KEY, 'true');
    toast.success('Reminders started! 🔔');
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
        fireReminder,
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
