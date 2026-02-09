// Hook to manage device-local offline preference
// Persists user's choice to enable/disable offline saving

import { useState, useEffect } from 'react';

const PREFERENCE_KEY = 'offline_save_preference';

export function useOfflinePreference() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(PREFERENCE_KEY);
      return stored ? JSON.parse(stored) : true; // Default to enabled
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PREFERENCE_KEY, JSON.stringify(enabled));
    } catch (error) {
      console.error('Failed to save offline preference:', error);
    }
  }, [enabled]);

  return {
    enabled,
    setEnabled,
  };
}
