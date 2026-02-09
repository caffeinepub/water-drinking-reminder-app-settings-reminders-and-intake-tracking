import { useState, useRef } from 'react';
import { useAddDailyIntake, useGetUserSettings, useGetUserRewards, useGetTodaysIntake } from '../../hooks/useQueries';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Droplet, Sparkles, Trophy, Flame } from 'lucide-react';

const CHILL_MESSAGES = [
  "Yess! Hydration on point! 💧",
  "That's what I'm talking about! 🔥",
  "You're doing amazing, bestie! ✨",
  "Slay! Keep it up! 💪",
  "Hydration check passed! 🎉",
  "Love that for you! 💙",
  "Vibes = immaculate! ☁️",
  "You're glowing already! ✨",
];

export default function QuickAddIntake() {
  const [customAmount, setCustomAmount] = useState('');
  const { data: settings } = useGetUserSettings();
  const { data: todaysIntake = 0 } = useGetTodaysIntake();
  const { data: rewards } = useGetUserRewards();
  const isOnline = useOnlineStatus();
  const addIntake = useAddDailyIntake();
  const previousRewardsRef = useRef(rewards);

  const cupSize = settings?.cupSize || 250;
  const dailyGoal = settings?.dailyGoal || 2000;

  const handleQuickAdd = async (amount: number) => {
    const previousIntake = todaysIntake;
    const previousRewards = previousRewardsRef.current;
    
    try {
      const result = await addIntake.mutateAsync(amount);
      
      // Check if action was queued for offline
      if (result?.queued) {
        toast.success('Saved offline. Will sync when back online.', {
          description: `Added ${amount} ml to your daily intake`,
          icon: <Droplet className="w-5 h-5" />,
        });
        return;
      }
      
      // Random chill message for online success
      const randomMessage = CHILL_MESSAGES[Math.floor(Math.random() * CHILL_MESSAGES.length)];
      toast.success(randomMessage, {
        description: `Added ${amount} ml to your daily intake`,
      });

      // Check for reward events after a short delay to allow backend to update
      setTimeout(() => {
        const newIntake = previousIntake + amount;
        const justMetGoal = previousIntake < dailyGoal && newIntake >= dailyGoal;
        
        if (justMetGoal) {
          toast.success("Daily goal completed! 🎯", {
            description: "You're on fire! Streak saved! 🔥",
            icon: <Trophy className="w-5 h-5" />,
          });
        }

        // Check for new badges (if rewards updated)
        if (rewards && previousRewards) {
          const newBadges = rewards.badges.length - previousRewards.badges.length;
          if (newBadges > 0) {
            toast.success("New badge unlocked! 🏆", {
              description: "Check your rewards panel!",
              icon: <Sparkles className="w-5 h-5" />,
            });
          }

          // Check for streak milestones
          const currentStreak = Number(rewards.streak);
          const previousStreak = Number(previousRewards.streak);
          if (currentStreak > previousStreak && currentStreak % 7 === 0) {
            toast.success(`${currentStreak} day streak! 🔥`, {
              description: "You're unstoppable!",
              icon: <Flame className="w-5 h-5" />,
            });
          }
        }
      }, 500);
    } catch (error) {
      toast.error('Failed to add intake');
      console.error(error);
    }
  };

  const handleCustomAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    await handleQuickAdd(amount);
    setCustomAmount('');
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Droplet className="w-5 h-5 text-primary" />
          Quick Add
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => handleQuickAdd(cupSize)}
            disabled={addIntake.isPending}
            className="h-20 flex flex-col gap-1 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all hover:scale-105"
          >
            <span className="text-2xl">💧</span>
            <span className="text-xs font-medium">{cupSize} ml</span>
          </Button>
          <Button
            onClick={() => handleQuickAdd(cupSize * 2)}
            disabled={addIntake.isPending}
            className="h-20 flex flex-col gap-1 bg-gradient-to-br from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 shadow-md hover:shadow-lg transition-all hover:scale-105"
          >
            <span className="text-2xl">🥤</span>
            <span className="text-xs font-medium">{cupSize * 2} ml</span>
          </Button>
          <Button
            onClick={() => handleQuickAdd(500)}
            disabled={addIntake.isPending}
            className="h-20 flex flex-col gap-1 bg-gradient-to-br from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 shadow-md hover:shadow-lg transition-all hover:scale-105"
          >
            <span className="text-2xl">🍶</span>
            <span className="text-xs font-medium">500 ml</span>
          </Button>
        </div>

        <form onSubmit={handleCustomAdd} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="custom-amount">Custom Amount (ml)</Label>
            <div className="flex gap-2">
              <Input
                id="custom-amount"
                type="number"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min="1"
                step="1"
              />
              <Button type="submit" disabled={addIntake.isPending} className="px-6">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
