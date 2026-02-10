import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { useOfflinePreference } from './useOfflinePreference';
import { OfflineQueue } from './offlineQueue';
import { toast } from 'sonner';
import { normalizeBackendError } from '../utils/backendError';

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const isOnline = useOnlineStatus();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const { enabled: offlineEnabled } = useOfflinePreference();
  const queryClient = useQueryClient();
  const isSyncingRef = useRef(false);

  useEffect(() => {
    if (!isOnline || !identity || !actor || !offlineEnabled || isSyncingRef.current) {
      return;
    }

    const syncQueue = async () => {
      isSyncingRef.current = true;
      const principal = identity.getPrincipal().toString();
      const queue = new OfflineQueue(principal);

      let action = queue.peek();
      let syncedCount = 0;
      let failedCount = 0;

      while (action) {
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
                BigInt(action.payload.time),
                action.payload.pace,
                action.payload.completed
              );
              break;
            case 'updateUserSettings':
              await actor.updateUserSettings(action.payload.dailyGoal, action.payload.cupSize);
              break;
            default:
              console.warn('Unknown action type:', action.type);
          }

          queue.dequeue();
          syncedCount++;
        } catch (error) {
          const errorMessage = normalizeBackendError(error);
          console.error(`Failed to sync action ${action.type}:`, error);
          
          toast.error('Sync failed', {
            description: errorMessage,
          });
          
          failedCount++;
          break;
        }

        action = queue.peek();
      }

      if (syncedCount > 0) {
        // Invalidate all relevant caches after successful sync
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['todaysIntake'] }),
          queryClient.invalidateQueries({ queryKey: ['intakeHistory'] }),
          queryClient.invalidateQueries({ queryKey: ['userRewards'] }),
          queryClient.invalidateQueries({ queryKey: ['todaysSleep'] }),
          queryClient.invalidateQueries({ queryKey: ['sleepHistory'] }),
          queryClient.invalidateQueries({ queryKey: ['todaysRuns'] }),
          queryClient.invalidateQueries({ queryKey: ['runningHistory'] }),
          queryClient.invalidateQueries({ queryKey: ['userSettings'] }),
        ]);

        toast.success('Synced!', {
          description: `${syncedCount} action${syncedCount > 1 ? 's' : ''} synced successfully.`,
        });
      }

      isSyncingRef.current = false;
    };

    syncQueue();
  }, [isOnline, identity, actor, offlineEnabled, queryClient]);

  return <>{children}</>;
}
