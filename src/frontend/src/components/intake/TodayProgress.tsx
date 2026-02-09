import { useGetTodaysIntake, useGetUserSettings } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Droplets, Target } from 'lucide-react';

export default function TodayProgress() {
  const { data: todaysIntake = 0, isLoading: intakeLoading } = useGetTodaysIntake();
  const { data: settings, isLoading: settingsLoading } = useGetUserSettings();

  const dailyGoal = settings?.dailyGoal || 2000;
  const progress = Math.min((todaysIntake / dailyGoal) * 100, 100);
  const remaining = Math.max(dailyGoal - todaysIntake, 0);
  const isGoalMet = todaysIntake >= dailyGoal;

  if (intakeLoading || settingsLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="h-32 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-primary" />
          Today's Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-3xl font-bold">{Math.round(todaysIntake)} ml</span>
            <span className="text-sm text-muted-foreground">of {dailyGoal} ml</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          {isGoalMet ? (
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Target className="w-4 h-4" />
              Goal achieved! 🎉
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {Math.round(remaining)} ml remaining
            </div>
          )}
          <div className="text-sm font-medium">
            {Math.round(progress)}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
