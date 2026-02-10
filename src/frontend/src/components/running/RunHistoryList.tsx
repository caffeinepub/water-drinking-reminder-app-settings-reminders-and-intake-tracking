import { useGetRunningHistory, useIsOfflineData } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import OfflineStaleNotice from '../offline/OfflineStaleNotice';
import { Footprints, Clock, Gauge, CheckCircle2, XCircle } from 'lucide-react';

export default function RunHistoryList() {
  const { data: history = [], isLoading } = useGetRunningHistory();
  const { isOfflineData, cachedAt } = useIsOfflineData('runningHistory');

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

  // Sort by timestamp (most recent first)
  const sortedHistory = [...history].sort((a, b) => Number(b.timestamp - a.timestamp));

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Footprints className="w-5 h-5 text-primary" />
          Running History
        </CardTitle>
        <CardDescription>
          Your recent running sessions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isOfflineData && <OfflineStaleNotice cachedAt={cachedAt} />}
          
          {sortedHistory.length === 0 && !isOfflineData && (
            <div className="text-center py-8 text-muted-foreground">
              <Footprints className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No running sessions logged yet.</p>
              <p className="text-sm mt-2">Start tracking your runs above!</p>
            </div>
          )}

          {sortedHistory.length === 0 && isOfflineData && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No cached running history available offline.</p>
              <p className="text-sm mt-2">Connect to the internet to load your data.</p>
            </div>
          )}

          {sortedHistory.map((run, index) => {
            const date = new Date(Number(run.timestamp) / 1_000_000);
            const timeInMinutes = Number(run.time) / 60_000_000_000;
            
            return (
              <div 
                key={index}
                className="p-4 rounded-2xl border-2 bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      run.completed 
                        ? 'bg-gradient-to-br from-success/20 to-success/10' 
                        : 'bg-gradient-to-br from-muted to-muted/50'
                    }`}>
                      {run.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : (
                        <XCircle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    run.completed 
                      ? 'bg-success/10 text-success' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {run.completed ? 'Completed' : 'Incomplete'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 rounded-lg bg-primary/5">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Footprints className="w-3 h-3 text-primary" />
                      <p className="text-xs text-muted-foreground">Distance</p>
                    </div>
                    <p className="font-bold text-primary">{run.distance.toFixed(2)} km</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-accent/5">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="w-3 h-3 text-accent" />
                      <p className="text-xs text-muted-foreground">Time</p>
                    </div>
                    <p className="font-bold text-accent">{timeInMinutes.toFixed(1)} min</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-primary/5">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Gauge className="w-3 h-3 text-primary" />
                      <p className="text-xs text-muted-foreground">Pace</p>
                    </div>
                    <p className="font-bold text-primary">{run.pace.toFixed(2)} min/km</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
