import { useGetIntakeHistory, useGetUserSettings, useIsOfflineData } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import EmptyState from './EmptyState';
import OfflineStaleNotice from '../offline/OfflineStaleNotice';
import { History, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';

export default function HistoryView() {
  const { data: history = [], isLoading } = useGetIntakeHistory();
  const { data: settings } = useGetUserSettings();
  const { isOfflineData, cachedAt } = useIsOfflineData(['intakeHistory']);

  const dailyGoal = settings?.dailyGoal || 2000;

  if (isLoading) {
    return (
      <Card className="border-2 shadow-lg">
        <CardContent className="pt-6">
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0 && !isOfflineData) {
    return <EmptyState />;
  }

  // Sort history by date (most recent first)
  const sortedHistory = [...history].sort((a, b) => Number(b.date - a.date));

  // Calculate average intake
  const averageIntake = history.length > 0 
    ? history.reduce((sum, log) => sum + log.totalIntake, 0) / history.length 
    : 0;
  const goalsMetCount = history.filter(log => log.totalIntake >= dailyGoal).length;

  return (
    <div className="space-y-4">
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Intake History
          </CardTitle>
          <CardDescription>
            Your water intake over the last 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {isOfflineData && <OfflineStaleNotice cachedAt={cachedAt} />}
            
            {history.length > 0 && (
              <>
                <div className="grid grid-cols-3 gap-3 p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border-2">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Average Daily</p>
                    <p className="text-2xl font-bold text-primary">{Math.round(averageIntake)} ml</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Days Tracked</p>
                    <p className="text-2xl font-bold text-accent">{history.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Goals Met</p>
                    <p className="text-2xl font-bold text-success">{goalsMetCount}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {sortedHistory.map((log) => {
                    const date = new Date(Number(log.date) * 86400000);
                    const isToday = date.toDateString() === new Date().toDateString();
                    const progress = Math.min((log.totalIntake / dailyGoal) * 100, 100);
                    const metGoal = log.totalIntake >= dailyGoal;

                    return (
                      <div 
                        key={log.date.toString()} 
                        className={`
                          space-y-2 p-4 rounded-2xl border-2 transition-all
                          ${metGoal 
                            ? 'bg-success/5 border-success/30 shadow-sm' 
                            : 'bg-card border-border'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            {metGoal ? (
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4 text-success" />
                                <Sparkles className="w-3 h-3 text-warning" />
                              </div>
                            ) : (
                              <TrendingDown className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <span className="text-sm font-bold">
                            {Math.round(log.totalIntake)} ml
                          </span>
                        </div>
                        <Progress 
                          value={progress} 
                          className={`h-2.5 ${metGoal ? 'bg-success/20' : ''}`}
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {Math.round(progress)}% of daily goal
                          </p>
                          {metGoal && (
                            <span className="text-xs font-medium text-success">Goal hit! 🎯</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {history.length === 0 && isOfflineData && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No cached history available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
