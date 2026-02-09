import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, UserData, HydrationLog, SleepLog, RunningLog, CustomReminderDefinition } from '../backend';

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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dailyGoal, cupSize }: { dailyGoal: number; cupSize: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateUserSettings(dailyGoal, cupSize);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
    },
  });
}

export function useGetTodaysIntake() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<number>({
    queryKey: ['todaysIntake'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTodaysIntake();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000,
  });
}

export function useAddDailyIntake() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addDailyIntake(amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todaysIntake'] });
      queryClient.invalidateQueries({ queryKey: ['intakeHistory'] });
    },
  });
}

export function useGetIntakeHistory() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<HydrationLog[]>({
    queryKey: ['intakeHistory'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getIntakeHistory();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Sleep tracking hooks
export function useGetTodaysSleep() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<number>({
    queryKey: ['todaysSleep'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTodaysSleep();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000,
  });
}

export function useAddSleepLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hours: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSleepLog(hours);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todaysSleep'] });
      queryClient.invalidateQueries({ queryKey: ['sleepHistory'] });
    },
  });
}

export function useGetSleepHistory() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SleepLog[]>({
    queryKey: ['sleepHistory'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSleepHistory();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Running tracking hooks
export function useLogRun() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ distance, time, pace, completed }: { distance: number; time: bigint; pace: number; completed: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.logRun(distance, time, pace, completed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['runningHistory'] });
      queryClient.invalidateQueries({ queryKey: ['todaysRuns'] });
    },
  });
}

export function useGetRunningHistory() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<RunningLog[]>({
    queryKey: ['runningHistory'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getRunningHistory();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetTodaysRuns() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<RunningLog[]>({
    queryKey: ['todaysRuns'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTodaysRuns();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000,
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
