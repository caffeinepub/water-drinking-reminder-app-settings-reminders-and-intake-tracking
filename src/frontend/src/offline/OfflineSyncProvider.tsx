// Provider that watches online status and syncs queued offline actions
// Handles sequential replay with error handling and cache invalidation

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useOfflinePreference } from './useOfflinePreference';
import { OfflineQueue } from './offlineQueue';
import { toast } from 'sonner';

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const isOnline = useOnlineStatus();
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { enabled: offlineEnabled } = useOfflinePreference();
  const queryClient = useQueryClient();
  const isSyncingRef = useRef(false);

  useEffect(() => {
    if (!isOnline || !actor || !identity || !offlineEnabled || isSyncingRef.current) {
      return;
    }

    const syncQueue = async () => {
      const principal = identity.getPrincipal().toString();
      const queue = new OfflineQueue(principal);

      if (queue.size() === 0) {
        return;
      }

      isSyncingRef.current = true;
      toast.info('Syncing offline changes...', { duration: 2000 });

      let syncedCount = 0;
      let failedAction = false;

      while (queue.size() > 0 && !failedAction) {
        const action = queue.peek();
        if (!action) break;

        try {
          switch (action.type) {
            case 'addDailyIntake':
              await actor.addDailyIntake(action.payload.amount);
              break;
            case 'addSleepLog':
              await actor.addSleepLog(action.payload.hours);
              break;
            case 'logRun':
              await actor.logRun(
                action.payload.distance,
                action.payload.time,
                action.payload.pace,
                action.payload.completed
              );
              break;
            case 'updateUserSettings':
              await actor.updateUserSettings(
                action.payload.dailyGoal,
                action.payload.cupSize
              );
              break;
          }

          queue.removeById(action.id);
          syncedCount++;
        } catch (error) {
          console.error('Failed to sync action:', action, error);
          toast.error('Sync failed for some changes', {
            description: 'Will retry when you\'re back online. Your data is safe.',
            duration: 5000,
          });
          failedAction = true;
        }
      }

      if (syncedCount > 0) {
        // Invalidate all relevant caches after successful sync
        await queryClient.invalidateQueries({ queryKey: ['todaysIntake'] });
        await queryClient.invalidateQueries({ queryKey: ['intakeHistory'] });
        await queryClient.invalidateQueries({ queryKey: ['userRewards'] });
        await queryClient.invalidateQueries({ queryKey: ['todaysSleep'] });
        await queryClient.invalidateQueries({ queryKey: ['sleepHistory'] });
        await queryClient.invalidateQueries({ queryKey: ['runningHistory'] });
        await queryClient.invalidateQueries({ queryKey: ['todaysRuns'] });
        await queryClient.invalidateQueries({ queryKey: ['userSettings'] });

        toast.success(`Synced ${syncedCount} offline change${syncedCount > 1 ? 's' : ''}! 🎉`);
      }

      isSyncingRef.current = false;
    };

    syncQueue();
  }, [isOnline, actor, identity, offlineEnabled, queryClient]);

  return <>{children}</>;
}
