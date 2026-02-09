import { useEffect, useRef } from 'react';
import { useReminderScheduler } from './useReminderSchedulerContext';
import { useGetUserRewards, useGetTodaysIntake, useGetUserSettings } from './useQueries';

const STREAK_BREAK_ENABLED_KEY = 'streak_break_reminder_enabled';
const STREAK_BREAK_HOURS_KEY = 'streak_break_warning_hours';
const STREAK_BREAK_LAST_FIRED_KEY = 'streak_break_last_fired_date';
const DEFAULT_WARNING_HOURS = 2;

export function useStreakBreakReminder() {
  const { fireReminder } = useReminderScheduler();
  const { data: rewards } = useGetUserRewards();
  const { data: todaysIntake } = useGetTodaysIntake();
  const { data: settings } = useGetUserSettings();
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkAndFireReminder = () => {
      // Check if enabled
      const enabled = localStorage.getItem(STREAK_BREAK_ENABLED_KEY) === 'true';
      if (!enabled) return;

      // Check if we have necessary data
      if (!rewards || !settings) return;

      // Only fire if streak > 0
      if (Number(rewards.streak) === 0) return;

      // Check if today's goal is already met
      const dailyGoal = settings.dailyGoal;
      const intake = todaysIntake || 0;
      if (intake >= dailyGoal) return;

      // Check if we're in the warning window
      const warningHours = parseInt(localStorage.getItem(STREAK_BREAK_HOURS_KEY) || String(DEFAULT_WARNING_HOURS));
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const hoursUntilEndOfDay = (endOfDay.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilEndOfDay > warningHours) return;

      // Check anti-spam: only fire once per day
      const today = new Date().toDateString();
      const lastFired = localStorage.getItem(STREAK_BREAK_LAST_FIRED_KEY);
      if (lastFired === today) return;

      // Fire the reminder
      const streakCount = Number(rewards.streak);
      fireReminder({
        type: 'streak-break',
        title: `Don't break the streak! 🔥`,
        body: `You're on a ${streakCount}-day streak! Drink some water to keep it going. You got this! 💧`,
        tag: 'streak-break-reminder',
      });

      // Mark as fired today
      localStorage.setItem(STREAK_BREAK_LAST_FIRED_KEY, today);
    };

    // Check every 15 minutes
    checkAndFireReminder();
    checkIntervalRef.current = setInterval(checkAndFireReminder, 15 * 60 * 1000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [fireReminder, rewards, todaysIntake, settings]);
}

export function getStreakBreakSettings() {
  return {
    enabled: localStorage.getItem(STREAK_BREAK_ENABLED_KEY) === 'true',
    warningHours: parseInt(localStorage.getItem(STREAK_BREAK_HOURS_KEY) || String(DEFAULT_WARNING_HOURS)),
  };
}

export function setStreakBreakSettings(enabled: boolean, warningHours: number) {
  localStorage.setItem(STREAK_BREAK_ENABLED_KEY, enabled ? 'true' : 'false');
  localStorage.setItem(STREAK_BREAK_HOURS_KEY, String(warningHours));
  
  // Clear the last-fired marker when explicitly toggling off then back on
  if (enabled) {
    const currentSetting = localStorage.getItem(STREAK_BREAK_ENABLED_KEY);
    if (currentSetting === 'false') {
      localStorage.removeItem(STREAK_BREAK_LAST_FIRED_KEY);
    }
  }
}
