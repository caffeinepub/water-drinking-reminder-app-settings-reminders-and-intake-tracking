import { useGetRunningHistory } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, Activity, Clock, Gauge } from 'lucide-react';

export default function RunHistoryList() {
  const { data: history = [], isLoading } = useGetRunningHistory();

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

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Activity className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No runs logged yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start tracking your runs to see your history here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedHistory = [...history].sort((a, b) => Number(b.timestamp - a.timestamp));
  
  const last7Days = sortedHistory.filter((run) => {
    const runDate = new Date(Number(run.timestamp) / 1000000);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return runDate >= sevenDaysAgo;
  });

  const totalDistance = last7Days.reduce((sum, run) => sum + run.distance, 0);
  const averagePace = last7Days.length > 0 
    ? last7Days.reduce((sum, run) => sum + run.pace, 0) / last7Days.length 
    : 0;

  const formatTime = (nanos: bigint) => {
    const seconds = Number(nanos) / 1000000000;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPace = (pace: number) => {
    const mins = Math.floor(pace);
    const secs = Math.floor((pace - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}/km`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Running History
        </CardTitle>
        <CardDescription>
          Your recent runs and statistics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Last 7 Days</p>
              <p className="text-2xl font-bold">{totalDistance.toFixed(1)} km</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Pace</p>
              <p className="text-2xl font-bold">{averagePace > 0 ? formatPace(averagePace) : '--'}</p>
            </div>
          </div>

          <div className="space-y-3">
            {sortedHistory.map((run, index) => {
              const date = new Date(Number(run.timestamp) / 1000000);
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <div key={index} className="space-y-2 p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <Badge variant={run.completed ? 'default' : 'secondary'} className="text-xs">
                        {run.completed ? 'Completed' : 'Incomplete'}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-muted-foreground" />
                      <span className="font-medium">{run.distance.toFixed(1)} km</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span>{formatTime(run.time)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-muted-foreground" />
                      <span>{formatPace(run.pace)}</span>
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
