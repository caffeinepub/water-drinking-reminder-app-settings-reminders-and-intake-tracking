import { useGetSleepHistory, useIsOfflineData } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import OfflineStaleNotice from '../offline/OfflineStaleNotice';
import { History, Moon } from 'lucide-react';

export default function SleepHistoryList() {
  const { data: history = [], isLoading } = useGetSleepHistory();
  const { isOfflineData, cachedAt } = useIsOfflineData(['sleepHistory']);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="h-48 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0 && !isOfflineData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Moon className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No sleep logs yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start tracking your sleep to see your history here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedHistory = [...history].sort((a, b) => Number(b.date - a.date));
  const averageSleep = history.length > 0 
    ? history.reduce((sum, log) => sum + log.hours, 0) / history.length 
    : 0;
  const recommendedSleep = 8;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Sleep History
        </CardTitle>
        <CardDescription>
          Your sleep logs over the last 7 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isOfflineData && <OfflineStaleNotice cachedAt={cachedAt} />}
          
          {history.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Average Sleep</p>
                  <p className="text-2xl font-bold">{averageSleep.toFixed(1)} hrs</p>
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
                  const progress = Math.min((log.hours / recommendedSleep) * 100, 100);
                  const metGoal = log.hours >= recommendedSleep;

                  return (
                    <div key={log.date.toString()} className="space-y-2 p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-sm font-medium">
                          {log.hours.toFixed(1)} hrs
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {metGoal ? '✓ Met recommended sleep goal' : `${(recommendedSleep - log.hours).toFixed(1)} hrs below recommended`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {history.length === 0 && isOfflineData && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No cached sleep history available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
