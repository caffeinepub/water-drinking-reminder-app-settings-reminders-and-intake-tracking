import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAddSleepLog } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Moon } from 'lucide-react';

export default function SleepLogForm() {
  const [hours, setHours] = useState('');
  const addSleepLog = useAddSleepLog();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hoursNum = parseFloat(hours);
    if (isNaN(hoursNum) || hoursNum <= 0 || hoursNum > 24) {
      toast.error('Please enter a valid number of hours (0-24)');
      return;
    }

    try {
      await addSleepLog.mutateAsync(hoursNum);
      toast.success(`Logged ${hoursNum} hours of sleep`);
      setHours('');
    } catch (error) {
      toast.error('Failed to log sleep');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="hours">Hours Slept</Label>
        <Input
          id="hours"
          type="number"
          step="0.5"
          min="0"
          max="24"
          placeholder="8"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          Enter the number of hours you slept (e.g., 7.5)
        </p>
      </div>

      <Button type="submit" disabled={addSleepLog.isPending} className="w-full">
        <Moon className="w-4 h-4 mr-2" />
        {addSleepLog.isPending ? 'Logging...' : 'Log Sleep'}
      </Button>
    </form>
  );
}
