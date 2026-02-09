import { useGetTodaysIntake, useGetUserSettings, useGetUserRewards, useIsOfflineData } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Droplets, TrendingUp, Flame } from 'lucide-react';
import GoalCelebrationCard from '../rewards/GoalCelebrationCard';
import OfflineStaleNotice from '../offline/OfflineStaleNotice';
import { useState, useEffect } from 'react';

export default function TodayProgress() {
  const { data: todaysIntake = 0, isLoading: intakeLoading } = useGetTodaysIntake();
  const { data: settings } = useGetUserSettings();
  const { data: rewards } = useGetUserRewards();
  const { isOfflineData, cachedAt } = useIsOfflineData(['todaysIntake']);
  const [showCelebration, setShowCelebration] = useState(false);
  const [previousGoalMet, setPreviousGoalMet] = useState(false);

  const dailyGoal = settings?.dailyGoal || 2000;
  const progress = Math.min((todaysIntake / dailyGoal) * 100, 100);
  const remaining = Math.max(dailyGoal - todaysIntake, 0);
  const goalMet = todaysIntake >= dailyGoal;

  // Detect when goal is first achieved today
  useEffect(() => {
    if (goalMet && !previousGoalMet && todaysIntake > 0) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
    }
    setPreviousGoalMet(goalMet);
  }, [goalMet, todaysIntake]);

  if (intakeLoading) {
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

  return (
    <>
      {showCelebration && <GoalCelebrationCard />}
      
      <Card className={`border-2 shadow-lg transition-all duration-300 ${goalMet ? 'border-success shadow-glow' : 'border-border'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Droplets className={`w-6 h-6 ${goalMet ? 'text-success' : 'text-primary'}`} />
              Today's Hydration
            </CardTitle>
            {rewards && rewards.streak > 0n && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-warning/10 border border-warning/30 rounded-full">
                <Flame className="w-4 h-4 text-warning" />
                <span className="text-sm font-bold text-warning">{Number(rewards.streak)} day streak!</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isOfflineData && <OfflineStaleNotice cachedAt={cachedAt} />}
          
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {Math.round(todaysIntake)} ml
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  of {dailyGoal} ml goal
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-muted-foreground">
                  {Math.round(progress)}%
                </p>
                {goalMet ? (
                  <div className="flex items-center gap-1 text-success text-sm font-medium mt-1">
                    <TrendingUp className="w-4 h-4" />
                    Goal crushed! 🎉
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(remaining)} ml to go
                  </p>
                )}
              </div>
            </div>
            
            <Progress 
              value={progress} 
              className={`h-3 ${goalMet ? 'bg-success/20' : ''}`}
            />
          </div>

          {goalMet && (
            <div className="p-3 bg-success/10 border border-success/30 rounded-xl text-center">
              <p className="text-sm font-medium text-success">
                You're absolutely killing it today! Keep this energy going! 💪✨
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
