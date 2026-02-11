import { useGetUserRewards } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, Trophy, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import BadgesGrid from './BadgesGrid';
import { normalizeBackendError } from '../../utils/backendError';

export default function RewardsPanel() {
  const { data: rewards, isLoading, error, refetch, isRefetching } = useGetUserRewards();

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Trophy className="w-6 h-6 text-primary" />
            Your Rewards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state with retry
  if (error) {
    const errorMessage = normalizeBackendError(error);
    return (
      <Card className="bg-gradient-to-br from-destructive/5 via-destructive/10 to-destructive/5 border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Trophy className="w-6 h-6 text-destructive" />
            Your Rewards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <AlertCircle className="w-12 h-12 text-destructive" />
            <p className="text-center text-muted-foreground max-w-md">
              {errorMessage}
            </p>
            <Button
              onClick={() => refetch()}
              disabled={isRefetching}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
              {isRefetching ? 'Retrying...' : 'Try Again'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Safe defaults for rewards data
  const streak = rewards?.streak ? Number(rewards.streak) : 0;
  const completedGoals = rewards?.completedGoals ? Number(rewards.completedGoals) : 0;
  const badges = Array.isArray(rewards?.badges) ? rewards.badges : [];

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Trophy className="w-6 h-6 text-primary" />
          Your Rewards
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Streak Card */}
        <div className="bg-gradient-to-r from-warning/20 to-warning/10 rounded-2xl p-6 border border-warning/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
              <p className="text-4xl font-bold text-warning flex items-center gap-2">
                <Flame className="w-8 h-8" />
                {streak}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {streak === 0 ? 'Start your streak!' : streak === 1 ? 'Keep it up!' : 'On fire! 🔥'}
              </p>
            </div>
          </div>
        </div>

        {/* Goals Completed Card */}
        <div className="bg-gradient-to-r from-success/20 to-success/10 rounded-2xl p-6 border border-success/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Goals Completed</p>
              <p className="text-4xl font-bold text-success flex items-center gap-2">
                <Sparkles className="w-8 h-8" />
                {completedGoals}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {completedGoals === 0 ? 'Complete your first goal!' : 'Crushing it! ✨'}
              </p>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Badges Earned
          </h3>
          <BadgesGrid badges={badges} />
        </div>
      </CardContent>
    </Card>
  );
}
