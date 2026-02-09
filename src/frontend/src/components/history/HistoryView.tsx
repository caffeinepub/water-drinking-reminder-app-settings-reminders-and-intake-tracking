import { useGetIntakeHistory, useGetUserSettings } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import EmptyState from './EmptyState';
import { History, TrendingUp, TrendingDown } from 'lucide-react';

export default function HistoryView() {
  const { data: history = [], isLoading } = useGetIntakeHistory();
  const { data: settings } = useGetUserSettings();

  const dailyGoal = settings?.dailyGoal || 2000;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return <EmptyState />;
  }

  // Sort history by date (most recent first)
  const sortedHistory = [...history].sort((a, b) => Number(b.date - a.date));

  // Calculate average intake
  const averageIntake = history.reduce((sum, log) => sum + log.totalIntake, 0) / history.length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Intake History
          </CardTitle>
          <CardDescription>
            Your water intake over the last 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Average Daily</p>
                <p className="text-2xl font-bold">{Math.round(averageIntake)} ml</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Days Tracked</p>
                <p className="text-2xl font-bold">{history.length}</p>
              </div>
            </div>

            <div className="space-y-3">
              {sortedHistory.map((log) => {
                const date = new Date(Number(log.date) * 86400000);
                const isToday = date.toDateString() === new Date().toDateString();
                const progress = Math.min((log.totalIntake / dailyGoal) * 100, 100);
                const metGoal = log.totalIntake >= dailyGoal;

                return (
                  <div key={log.date.toString()} className="space-y-2 p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        {metGoal ? (
                          <TrendingUp className="w-4 h-4 text-primary" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-sm font-medium">
                        {Math.round(log.totalIntake)} ml
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {Math.round(progress)}% of daily goal
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
