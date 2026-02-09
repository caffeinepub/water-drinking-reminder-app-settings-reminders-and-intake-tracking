import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, UserData, HydrationLog } from '../backend';

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
    refetchInterval: 30000, // Refetch every 30 seconds
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
