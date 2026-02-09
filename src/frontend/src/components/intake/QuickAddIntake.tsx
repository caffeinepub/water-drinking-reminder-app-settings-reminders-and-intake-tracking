import { useState, useRef } from 'react';
import { useAddDailyIntake, useGetUserSettings, useGetUserRewards, useGetTodaysIntake } from '../../hooks/useQueries';
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
  const addIntake = useAddDailyIntake();
  const previousRewardsRef = useRef(rewards);

  const cupSize = settings?.cupSize || 250;
  const dailyGoal = settings?.dailyGoal || 2000;

  const handleQuickAdd = async (amount: number) => {
    const previousIntake = todaysIntake;
    const previousRewards = previousRewardsRef.current;
    
    try {
      await addIntake.mutateAsync(amount);
      
      // Random chill message
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
              description: "Check your rewards to see what you earned!",
              icon: <Sparkles className="w-5 h-5" />,
            });
          }

          // Check for streak milestone
          const currentStreak = Number(rewards.streak);
          const previousStreak = Number(previousRewards.streak);
          if (currentStreak > previousStreak && currentStreak % 7 === 0) {
            toast.success(`${currentStreak} day streak! 🔥`, {
              description: "You're unstoppable! Keep the momentum!",
              icon: <Flame className="w-5 h-5" />,
            });
          }
        }
      }, 1000);

      previousRewardsRef.current = rewards;
    } catch (error) {
      toast.error('Oops! Something went wrong', {
        description: 'Try again in a sec!',
      });
      console.error('Add intake error:', error);
    }
  };

  const handleCustomAdd = async () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid amount, bestie!');
      return;
    }
    await handleQuickAdd(amount);
    setCustomAmount('');
  };

  const quickAddOptions = [
    { label: '1 Cup', amount: cupSize, emoji: '☕' },
    { label: '250 ml', amount: 250, emoji: '💧' },
    { label: '500 ml', amount: 500, emoji: '🥤' },
  ];

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Log Your Water
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {quickAddOptions.map((option) => (
            <Button
              key={option.label}
              variant="outline"
              onClick={() => handleQuickAdd(option.amount)}
              disabled={addIntake.isPending}
              className="h-auto py-4 flex flex-col gap-2 border-2 hover:border-primary hover:bg-primary/5 hover:shadow-glow transition-all duration-200 group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{option.emoji}</span>
              <span className="text-xs font-semibold">{option.label}</span>
              <span className="text-xs text-muted-foreground">{option.amount} ml</span>
            </Button>
          ))}
        </div>

        <div className="space-y-2 pt-2 border-t-2 border-dashed">
          <Label htmlFor="custom-amount" className="text-sm font-medium">
            Custom Amount (ml)
          </Label>
          <div className="flex gap-2">
            <Input
              id="custom-amount"
              type="number"
              placeholder="Enter amount"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCustomAdd();
                }
              }}
              className="border-2"
            />
            <Button
              onClick={handleCustomAdd}
              disabled={addIntake.isPending || !customAmount}
              className="shadow-md hover:shadow-glow transition-all"
            >
              {addIntake.isPending ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                'Add'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
