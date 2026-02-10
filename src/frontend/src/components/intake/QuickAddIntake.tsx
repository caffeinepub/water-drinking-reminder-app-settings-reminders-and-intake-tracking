import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAddDailyIntake, useGetUserSettings, useGetUserRewards, useGetTodaysIntake } from '../../hooks/useQueries';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Droplet, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeBackendError } from '../../utils/backendError';
import type { UserRewards } from '../../backend';

export default function QuickAddIntake() {
  const [customAmount, setCustomAmount] = useState('');
  const addIntakeMutation = useAddDailyIntake();
  const { data: settings } = useGetUserSettings();
  const { data: todaysIntake } = useGetTodaysIntake();
  const { data: currentRewards } = useGetUserRewards();
  const isOnline = useOnlineStatus();
  const queryClient = useQueryClient();
  
  // Track previous rewards to detect changes
  const previousRewardsRef = useRef<UserRewards | undefined>(currentRewards);

  // Keep ref in sync with current rewards
  useEffect(() => {
    if (currentRewards) {
      previousRewardsRef.current = currentRewards;
    }
  }, [currentRewards]);

  const cupSize = settings?.cupSize || 250;

  const handleQuickAdd = async (amount: number) => {
    if (!isOnline) {
      toast.info('Queued for sync', {
        description: 'Your intake will be saved when you\'re back online.',
      });
    }

    try {
      await addIntakeMutation.mutateAsync(amount);

      // If offline, the action was queued - don't show reward updates
      if (!isOnline) {
        return;
      }

      // Wait for queries to refetch and get fresh data
      await queryClient.refetchQueries({ queryKey: ['userRewards'] });
      await queryClient.refetchQueries({ queryKey: ['todaysIntake'] });

      // Get fresh rewards from cache after refetch
      const freshRewards = queryClient.getQueryData<UserRewards>(['userRewards']);
      const freshIntake = queryClient.getQueryData<number>(['todaysIntake']);
      const previousRewards = previousRewardsRef.current;

      if (!freshRewards || !previousRewards) {
        toast.success('Intake logged!', {
          description: `Added ${amount}ml to your daily total.`,
        });
        return;
      }

      // Check for goal completion
      const dailyGoal = settings?.dailyGoal || 2000;
      const previousIntake = (todaysIntake || 0);
      const wasGoalMet = previousIntake >= dailyGoal;
      const isGoalMetNow = (freshIntake || 0) >= dailyGoal;

      if (!wasGoalMet && isGoalMetNow) {
        toast.success('🎉 Daily goal achieved!', {
          description: 'You\'re crushing it today!',
          duration: 4000,
        });
      }

      // Check for streak changes
      const previousStreak = Number(previousRewards.streak || 0n);
      const currentStreak = Number(freshRewards.streak || 0n);

      if (currentStreak > previousStreak) {
        toast.success(`🔥 ${currentStreak}-day streak!`, {
          description: 'Keep the momentum going!',
          duration: 4000,
        });
      }

      // Check for new badges
      const previousBadges = previousRewards.badges || [];
      const currentBadges = freshRewards.badges || [];

      if (currentBadges.length > previousBadges.length) {
        const newBadges = currentBadges.filter(
          badge => !previousBadges.some(prev => prev === badge)
        );

        newBadges.forEach(badge => {
          const badgeName = badge.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          toast.success(`🏆 New badge unlocked!`, {
            description: `You earned the ${badgeName} badge!`,
            duration: 5000,
          });
        });
      }

      // Show basic success if no special events
      if (wasGoalMet || currentStreak === previousStreak) {
        toast.success('Intake logged!', {
          description: `Added ${amount}ml to your daily total.`,
        });
      }

    } catch (error) {
      const errorMessage = normalizeBackendError(error);
      toast.error('Failed to log intake', {
        description: errorMessage,
      });
      console.error('Error adding intake:', error);
    }
  };

  const handleCustomAdd = async () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid amount', {
        description: 'Please enter a valid number greater than 0.',
      });
      return;
    }

    await handleQuickAdd(amount);
    setCustomAmount('');
  };

  const isLoading = addIntakeMutation.isPending;

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Droplet className="w-5 h-5 text-primary" />
          Quick Add
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick add buttons */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            onClick={() => handleQuickAdd(cupSize)}
            disabled={isLoading}
            className="h-20 flex flex-col gap-1 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
          >
            <Droplet className="w-6 h-6" />
            <span className="text-sm font-semibold">{cupSize}ml</span>
          </Button>
          <Button
            onClick={() => handleQuickAdd(cupSize * 2)}
            disabled={isLoading}
            className="h-20 flex flex-col gap-1 bg-gradient-to-br from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 shadow-lg"
          >
            <Droplet className="w-6 h-6" />
            <span className="text-sm font-semibold">{cupSize * 2}ml</span>
          </Button>
          <Button
            onClick={() => handleQuickAdd(750)}
            disabled={isLoading}
            className="h-20 flex flex-col gap-1 bg-gradient-to-br from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 shadow-lg"
          >
            <Droplet className="w-6 h-6" />
            <span className="text-sm font-semibold">750ml</span>
          </Button>
        </div>

        {/* Custom amount input */}
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Custom amount (ml)"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCustomAdd();
              }
            }}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleCustomAdd}
            disabled={isLoading || !customAmount}
            size="icon"
            className="shrink-0"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
