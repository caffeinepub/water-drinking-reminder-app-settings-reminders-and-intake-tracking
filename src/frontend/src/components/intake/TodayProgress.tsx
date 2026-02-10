import { useGetTodaysIntake, useGetUserSettings, useGetUserRewards, useIsOfflineData } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import OfflineStaleNotice from '../offline/OfflineStaleNotice';
import { Droplets, Flame, Target } from 'lucide-react';

export default function TodayProgress() {
  const { data: todaysIntake = 0, isLoading: intakeLoading } = useGetTodaysIntake();
  const { data: settings, isLoading: settingsLoading } = useGetUserSettings();
  const { data: rewards } = useGetUserRewards();
  const { isOfflineData, cachedAt } = useIsOfflineData('todaysIntake');

  const dailyGoal = settings?.dailyGoal || 2000;
  const progress = Math.min((todaysIntake / dailyGoal) * 100, 100);
  const remaining = Math.max(dailyGoal - todaysIntake, 0);
  const streak = Number(rewards?.streak || 0);

  if (intakeLoading || settingsLoading) {
    return (
      <Card className="border-2 shadow-lg bg-gradient-to-br from-card via-primary/5 to-accent/5">
        <CardContent className="pt-6">
          <div className="h-48 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 shadow-lg bg-gradient-to-br from-card via-primary/5 to-accent/5 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                <Droplets className="w-5 h-5 text-primary-foreground" />
              </div>
              Today's Progress
            </CardTitle>
            <CardDescription className="mt-2">
              Keep it up! You're doing great 💧
            </CardDescription>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-br from-warning/20 to-destructive/20 border-2 border-warning/30">
              <Flame className="w-5 h-5 text-warning" />
              <span className="font-bold text-lg">{streak}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 relative">
        {isOfflineData && <OfflineStaleNotice cachedAt={cachedAt} />}
        
        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <span className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {Math.round(todaysIntake)} ml
            </span>
            <span className="text-lg text-muted-foreground">
              / {dailyGoal} ml
            </span>
          </div>
          <Progress value={progress} className="h-4 shadow-inner" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{Math.round(progress)}% complete</span>
            {remaining > 0 ? (
              <span className="text-muted-foreground flex items-center gap-1">
                <Target className="w-3 h-3" />
                {Math.round(remaining)} ml to go
              </span>
            ) : (
              <span className="text-success font-semibold flex items-center gap-1">
                Goal reached! 🎉
              </span>
            )}
          </div>
        </div>

        {progress >= 100 && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-success/10 to-success/5 border-2 border-success/30 animate-pulse-glow">
            <p className="text-center font-semibold text-success">
              Amazing work! You've hit your daily goal! 🌟
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
