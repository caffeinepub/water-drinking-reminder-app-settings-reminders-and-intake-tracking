import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useLogRun } from '../../hooks/useQueries';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { toast } from 'sonner';
import { Activity } from 'lucide-react';

export default function RunLogForm() {
  const [distance, setDistance] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [completed, setCompleted] = useState(true);
  const isOnline = useOnlineStatus();
  const logRun = useLogRun();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const distanceNum = parseFloat(distance);
    if (isNaN(distanceNum) || distanceNum <= 0) {
      toast.error('Please enter a valid distance');
      return;
    }

    const minutesNum = parseInt(minutes) || 0;
    const secondsNum = parseInt(seconds) || 0;
    
    if (minutesNum < 0 || secondsNum < 0 || secondsNum >= 60) {
      toast.error('Please enter valid time values');
      return;
    }

    const totalSeconds = minutesNum * 60 + secondsNum;
    if (totalSeconds <= 0) {
      toast.error('Please enter a valid duration');
      return;
    }

    const timeNanos = BigInt(totalSeconds) * BigInt(1000000000);
    const pace = totalSeconds / 60 / distanceNum;

    try {
      const result = await logRun.mutateAsync({
        distance: distanceNum,
        time: timeNanos,
        pace,
        completed,
      });
      
      // Check if action was queued for offline
      if (result?.queued) {
        toast.success('Saved offline. Will sync when back online.', {
          description: `Logged ${distanceNum} km run`,
        });
      } else {
        toast.success(`Logged ${distanceNum} km run`);
      }
      
      setDistance('');
      setMinutes('');
      setSeconds('');
      setCompleted(true);
    } catch (error) {
      toast.error('Failed to log run');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="distance">Distance (km)</Label>
        <Input
          id="distance"
          type="number"
          step="0.1"
          min="0"
          placeholder="5.0"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Duration</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Input
              type="number"
              min="0"
              placeholder="Minutes"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </div>
          <div>
            <Input
              type="number"
              min="0"
              max="59"
              placeholder="Seconds"
              value={seconds}
              onChange={(e) => setSeconds(e.target.value)}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Enter the time it took to complete the run
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="completed"
          checked={completed}
          onCheckedChange={(checked) => setCompleted(checked === true)}
        />
        <Label htmlFor="completed" className="text-sm font-normal cursor-pointer">
          Run completed
        </Label>
      </div>

      <Button type="submit" disabled={logRun.isPending} className="w-full">
        <Activity className="w-4 h-4 mr-2" />
        {logRun.isPending ? 'Logging...' : 'Log Run'}
      </Button>
    </form>
  );
}
