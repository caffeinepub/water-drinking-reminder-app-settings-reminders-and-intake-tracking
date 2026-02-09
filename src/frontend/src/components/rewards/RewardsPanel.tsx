import { useGetUserRewards } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Trophy, Sparkles } from 'lucide-react';
import BadgesGrid from './BadgesGrid';

export default function RewardsPanel() {
  const { data: rewards, isLoading } = useGetUserRewards();

  if (isLoading) {
    return (
      <Card className="border-2 shadow-lg">
        <CardContent className="pt-6">
          <div className="h-32 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentStreak = Number(rewards?.streak || 0n);
  const completedGoals = Number(rewards?.completedGoals || 0n);
  const badges = rewards?.badges || [];

  return (
    <Card className="border-2 shadow-lg bg-gradient-to-br from-card to-accent/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-warning" />
          Your Rewards
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-warning/10 to-warning/5 border-2 border-warning/30 rounded-2xl text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="w-6 h-6 text-warning" />
              <p className="text-3xl font-bold text-warning">{currentStreak}</p>
            </div>
            <p className="text-xs font-medium text-muted-foreground">Day Streak</p>
            {currentStreak > 0 && (
              <p className="text-xs text-warning/80 mt-1">Keep it going! 🔥</p>
            )}
          </div>

          <div className="p-4 bg-gradient-to-br from-success/10 to-success/5 border-2 border-success/30 rounded-2xl text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-success" />
              <p className="text-3xl font-bold text-success">{completedGoals}</p>
            </div>
            <p className="text-xs font-medium text-muted-foreground">Goals Hit</p>
            {completedGoals > 0 && (
              <p className="text-xs text-success/80 mt-1">You're crushing it! ✨</p>
            )}
          </div>
        </div>

        {/* Badges Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              Badges Earned
            </h3>
            <span className="text-xs text-muted-foreground">
              {badges.length} / 4 unlocked
            </span>
          </div>
          <BadgesGrid badges={badges} />
        </div>

        {currentStreak === 0 && completedGoals === 0 && badges.length === 0 && (
          <div className="text-center py-4 px-3 bg-muted/30 rounded-xl border-2 border-dashed">
            <p className="text-sm text-muted-foreground">
              Start logging to earn your first rewards! 🎯
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
