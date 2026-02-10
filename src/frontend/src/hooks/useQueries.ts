import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { useOnlineStatus } from './useOnlineStatus';
import { useOfflinePreference } from '../offline/useOfflinePreference';
import { OfflineQueue } from '../offline/offlineQueue';
import { writeOfflineData, readOfflineData } from '../offline/offlineStorage';
import type { UserProfile, UserData, HydrationLog, SleepLog, RunningLog, CustomReminderDefinition, UserRewards, AnalyticsMetrics, UserAnalyticsEntry } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        console.error('Failed to check admin status:', error);
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

export function useGetUserSettings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserData | null>({
    queryKey: ['userSettings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUserSettings();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUpdateUserSettings() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const isOnline = useOnlineStatus();
  const { enabled: offlineEnabled } = useOfflinePreference();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dailyGoal, cupSize }: { dailyGoal: number; cupSize: number }) => {
      if (!actor) throw new Error('Actor not available');
      
      // If offline and offline mode enabled, queue the action
      if (!isOnline && offlineEnabled && identity) {
        const principal = identity.getPrincipal().toString();
        const queue = new OfflineQueue(principal);
        queue.enqueue('updateUserSettings', { dailyGoal, cupSize });
        return { queued: true };
      }
      
      return actor.updateUserSettings(dailyGoal, cupSize);
    },
    onSuccess: (result: any) => {
      if (result?.queued) {
        // Don't invalidate queries when queued
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
    },
  });
}

export function useGetTodaysIntake() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isOnline = useOnlineStatus();
  const { enabled: offlineEnabled } = useOfflinePreference();

  return useQuery<number>({
    queryKey: ['todaysIntake'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      // If offline and offline mode enabled, return cached data
      if (!isOnline && offlineEnabled && identity) {
        const principal = identity.getPrincipal().toString();
        const cached = readOfflineData<number>(principal, 'todaysIntake');
        if (cached) {
          return cached.data;
        }
      }
      
      const data = await actor.getTodaysIntake();
      
      // Cache successful online fetch
      if (isOnline && offlineEnabled && identity) {
        const principal = identity.getPrincipal().toString();
        writeOfflineData(principal, 'todaysIntake', data);
      }
      
      return data;
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000,
  });
}

export function useAddDailyIntake() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const isOnline = useOnlineStatus();
  const { enabled: offlineEnabled } = useOfflinePreference();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) => {
      if (!actor) throw new Error('Actor not available');
      
      // If offline and offline mode enabled, queue the action
      if (!isOnline && offlineEnabled && identity) {
        const principal = identity.getPrincipal().toString();
        const queue = new OfflineQueue(principal);
        queue.enqueue('addDailyIntake', { amount });
        return { queued: true };
      }
      
      return actor.addDailyIntake(amount);
    },
    onSuccess: async (result: any) => {
      if (result?.queued) {
        // Don't invalidate queries when queued
        return;
      }
      
      // Invalidate and refetch all related queries to ensure fresh data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['todaysIntake'] }),
        queryClient.invalidateQueries({ queryKey: ['intakeHistory'] }),
        queryClient.invalidateQueries({ queryKey: ['userRewards'] }),
      ]);
    },
  });
}

export function useGetIntakeHistory() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isOnline = useOnlineStatus();
  const { enabled: offlineEnabled } = useOfflinePreference();

  return useQuery<HydrationLog[]>({
    queryKey: ['intakeHistory'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      // If offline and offline mode enabled, return cached data
      if (!isOnline && offlineEnabled && identity) {
        const principal = identity.getPrincipal().toString();
        const cached = readOfflineData<HydrationLog[]>(principal, 'intakeHistory');
        if (cached) {
          return cached.data;
        }
      }
      
      const data = await actor.getIntakeHistory();
      
      // Cache successful online fetch
      if (isOnline && offlineEnabled && identity) {
        const principal = identity.getPrincipal().toString();
        writeOfflineData(principal, 'intakeHistory', data);
      }
      
      return data;
    },
    enabled: !!actor && !actorFetching,
  });
}

// Rewards hooks
export function useGetUserRewards() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserRewards>({
    queryKey: ['userRewards'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUserRewards();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Sleep tracking hooks
export function useGetTodaysSleep() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isOnline = useOnlineStatus();
  const { enabled: offlineEnabled } = useOfflinePreference();

  return useQuery<number>({
    queryKey: ['todaysSleep'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      // If offline and offline mode enabled, return cached data
      if (!isOnline && offlineEnabled && identity) {
        const principal = identity.getPrincipal().toString();
        const cached = readOfflineData<number>(principal, 'todaysSleep');
        if (cached) {
          return cached.data;
        }
      }
      
      const data = await actor.getTodaysSleep();
      
      // Cache successful online fetch
      if (isOnline && offlineEnabled && identity) {
        const principal = identity.getPrincipal().toString();
        writeOfflineData(principal, 'todaysSleep', data);
      }
      
      return data;
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddSleepLog() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const isOnline = useOnlineStatus();
  const { enabled: offlineEnabled } = useOfflinePreference();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hours: number) => {
      if (!actor) throw new Error('Actor not available');
      
      // If offline and offline mode enabled, queue the action
      if (!isOnline && offlineEnabled && identity) {
        const principal = identity.getPrincipal().toString();
        const queue = new OfflineQueue(principal);
        queue.enqueue('addSleepLog', { hours });
        return { queued: true };
      }
      
      return actor.addSleepLog(hours);
    },
    onSuccess: (result: any) => {
      if (result?.queued) {
        // Don't invalidate queries when queued
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['todaysSleep'] });
      queryClient.invalidateQueries({ queryKey: ['sleepHistory'] });
    },
  });
}

export function useGetSleepHistory() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isOnline = useOnlineStatus();
  const { enabled: offlineEnabled } = useOfflinePreference();

  return useQuery<SleepLog[]>({
    queryKey: ['sleepHistory'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      // If offline and offline mode enabled, return cached data
      if (!isOnline && offlineEnabled && identity) {
        const principal = identity.getPrincipal().toString();
        const cached = readOfflineData<SleepLog[]>(principal, 'sleepHistory');
        if (cached) {
          return cached.data;
        }
      }
      
      const data = await actor.getSleepHistory();
      
      // Cache successful online fetch
      if (isOnline && offlineEnabled && identity) {
        const principal = identity.getPrincipal().toString();
        writeOfflineData(principal, 'sleepHistory', data);
      }
      
      return data;
    },
    enabled: !!actor && !actorFetching,
  });
}

// Running tracking hooks
export function useLogRun() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const isOnline = useOnlineStatus();
  const { enabled: offlineEnabled } = useOfflinePreference();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ distance, time, pace, completed }: { distance: number; time: bigint; pace: number; completed: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      
      // If offline and offline mode enabled, queue the action
      if (!isOnline && offlineEnabled && identity) {
        const principal = identity.getPrincipal().toString();
        const queue = new OfflineQueue(principal);
        queue.enqueue('logRun', { distance, time: time.toString(), pace, completed });
        return { queued: true };
      }
      
      return actor.logRun(distance, time, pace, completed);
    },
    onSuccess: (result: any) => {
      if (result?.queued) {
        // Don't invalidate queries when queued
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['todaysRuns'] });
      queryClient.invalidateQueries({ queryKey: ['runningHistory'] });
    },
  });
}

export function useGetRunningHistory() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isOnline = useOnlineStatus();
  const { enabled: offlineEnabled } = useOfflinePreference();

  return useQuery<RunningLog[]>({
    queryKey: ['runningHistory'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      // If offline and offline mode enabled, return cached data
      if (!isOnline && offlineEnabled && identity) {
        const principal = identity.getPrincipal().toString();
        const cached = readOfflineData<RunningLog[]>(principal, 'runningHistory');
        if (cached) {
          return cached.data;
        }
      }
      
      const data = await actor.getRunningHistory();
      
      // Cache successful online fetch
      if (isOnline && offlineEnabled && identity) {
        const principal = identity.getPrincipal().toString();
        writeOfflineData(principal, 'runningHistory', data);
      }
      
      return data;
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetTodaysRuns() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isOnline = useOnlineStatus();
  const { enabled: offlineEnabled } = useOfflinePreference();

  return useQuery<RunningLog[]>({
    queryKey: ['todaysRuns'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      // If offline and offline mode enabled, return cached data
      if (!isOnline && offlineEnabled && identity) {
        const principal = identity.getPrincipal().toString();
        const cached = readOfflineData<RunningLog[]>(principal, 'todaysRuns');
        if (cached) {
          return cached.data;
        }
      }
      
      const data = await actor.getTodaysRuns();
      
      // Cache successful online fetch
      if (isOnline && offlineEnabled && identity) {
        const principal = identity.getPrincipal().toString();
        writeOfflineData(principal, 'todaysRuns', data);
      }
      
      return data;
    },
    enabled: !!actor && !actorFetching,
  });
}

// Custom reminders hooks
export function useListCustomReminders() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CustomReminderDefinition[]>({
    queryKey: ['customReminders'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listCustomReminders();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddCustomReminder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, description, interval, enabled }: { name: string; description: string; interval: bigint; enabled: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCustomReminder(name, description, interval, enabled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customReminders'] });
    },
  });
}

export function useUpdateCustomReminder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, description, interval, enabled }: { name: string; description: string; interval: bigint; enabled: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCustomReminder(name, description, interval, enabled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customReminders'] });
    },
  });
}

export function useRemoveCustomReminder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeCustomReminder(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customReminders'] });
    },
  });
}

// Analytics hooks (admin only)
export function useGetAnalyticsMetrics() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();

  return useQuery<AnalyticsMetrics>({
    queryKey: ['analyticsMetrics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAnalyticsMetrics();
    },
    enabled: !!actor && !actorFetching && isAdmin === true,
  });
}

export function useGetAllUserAnalytics() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();

  return useQuery<UserAnalyticsEntry[]>({
    queryKey: ['allUserAnalytics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllUserAnalytics();
    },
    enabled: !!actor && !actorFetching && isAdmin === true,
  });
}

// Utility hook to check if data is from offline cache
export function useIsOfflineData(queryKey: string) {
  const { identity } = useInternetIdentity();
  const isOnline = useOnlineStatus();
  const { enabled: offlineEnabled } = useOfflinePreference();
  const queryClient = useQueryClient();

  if (!isOnline && offlineEnabled && identity) {
    const queryState = queryClient.getQueryState([queryKey]);
    if (queryState?.dataUpdatedAt) {
      return {
        isOfflineData: true,
        cachedAt: queryState.dataUpdatedAt,
      };
    }
  }

  return {
    isOfflineData: false,
    cachedAt: undefined,
  };
}
