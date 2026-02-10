import { useGetSleepHistory, useIsOfflineData } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import OfflineStaleNotice from '../offline/OfflineStaleNotice';
import { Moon, TrendingUp, TrendingDown } from 'lucide-react';

export default function SleepHistoryList() {
  const { data: history = [], isLoading } = useGetSleepHistory();
  const { isOfflineData, cachedAt } = useIsOfflineData('sleepHistory');

  if (isLoading) {
    return (
      <Card className="border-2 shadow-lg">
        <CardContent className="pt-6">
          <div className="h-48 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort by date (most recent first)
  const sortedHistory = [...history].sort((a, b) => Number(b.date - a.date));

  // Calculate average
  const averageHours = history.length > 0 
    ? history.reduce((sum, log) => sum + log.hours, 0) / history.length 
    : 0;

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Moon className="w-5 h-5 text-primary" />
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
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border-2">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Average Sleep</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {averageHours.toFixed(1)} hrs
                </p>
              </div>
            </div>
          )}

          {sortedHistory.length === 0 && !isOfflineData && (
            <div className="text-center py-8 text-muted-foreground">
              <Moon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No sleep logs yet.</p>
              <p className="text-sm mt-2">Start tracking your sleep above!</p>
            </div>
          )}

          {sortedHistory.length === 0 && isOfflineData && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No cached sleep history available offline.</p>
              <p className="text-sm mt-2">Connect to the internet to load your data.</p>
            </div>
          )}

          <div className="space-y-3">
            {sortedHistory.map((log) => {
              const date = new Date(Number(log.date) * 86400000);
              const isToday = date.toDateString() === new Date().toDateString();
              const isGoodSleep = log.hours >= 7;

              return (
                <div 
                  key={log.date.toString()}
                  className={`
                    p-4 rounded-2xl border-2 transition-all
                    ${isGoodSleep 
                      ? 'bg-success/5 border-success/30' 
                      : 'bg-card border-border'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isGoodSleep 
                          ? 'bg-gradient-to-br from-success/20 to-success/10' 
                          : 'bg-gradient-to-br from-muted to-muted/50'
                      }`}>
                        <Moon className={`w-5 h-5 ${isGoodSleep ? 'text-success' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isGoodSleep ? 'Good rest! 😴' : 'Could use more sleep 💤'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">
                        {log.hours.toFixed(1)}
                      </span>
                      <span className="text-sm text-muted-foreground">hrs</span>
                      {isGoodSleep ? (
                        <TrendingUp className="w-4 h-4 text-success ml-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-muted-foreground ml-1" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
