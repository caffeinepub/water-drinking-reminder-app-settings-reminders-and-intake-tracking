import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useListCustomReminders, useAddCustomReminder, useUpdateCustomReminder, useRemoveCustomReminder } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Droplets, Moon, Plus, Trash2 } from 'lucide-react';

export default function ReminderControls() {
  const { data: reminders = [], isLoading } = useListCustomReminders();
  const addReminder = useAddCustomReminder();
  const updateReminder = useUpdateCustomReminder();
  const removeReminder = useRemoveCustomReminder();

  const [newReminderName, setNewReminderName] = useState('');
  const [newReminderDescription, setNewReminderDescription] = useState('');
  const [newReminderInterval, setNewReminderInterval] = useState('3600');

  const [hydrationEnabled, setHydrationEnabled] = useState(() => {
    return localStorage.getItem('hydrationReminderEnabled') === 'true';
  });

  const [sleepEnabled, setSleepEnabled] = useState(() => {
    return localStorage.getItem('sleepReminderEnabled') === 'true';
  });

  const [streakBreakEnabled, setStreakBreakEnabled] = useState(() => {
    return localStorage.getItem('streakBreakReminderEnabled') === 'true';
  });

  const handleHydrationToggle = (enabled: boolean) => {
    setHydrationEnabled(enabled);
    localStorage.setItem('hydrationReminderEnabled', enabled.toString());
    toast.success(enabled ? 'Hydration reminders enabled' : 'Hydration reminders disabled');
  };

  const handleSleepToggle = (enabled: boolean) => {
    setSleepEnabled(enabled);
    localStorage.setItem('sleepReminderEnabled', enabled.toString());
    toast.success(enabled ? 'Sleep reminders enabled' : 'Sleep reminders disabled');
  };

  const handleStreakBreakToggle = (enabled: boolean) => {
    setStreakBreakEnabled(enabled);
    localStorage.setItem('streakBreakReminderEnabled', enabled.toString());
    toast.success(enabled ? 'Streak-break reminders enabled' : 'Streak-break reminders disabled');
  };

  const handleAddReminder = async () => {
    if (!newReminderName.trim() || !newReminderDescription.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const intervalSeconds = parseInt(newReminderInterval);
    if (isNaN(intervalSeconds) || intervalSeconds <= 0) {
      toast.error('Please enter a valid interval in seconds');
      return;
    }

    try {
      await addReminder.mutateAsync({
        name: newReminderName,
        description: newReminderDescription,
        interval: BigInt(intervalSeconds * 1_000_000_000),
        enabled: true,
      });
      toast.success('Custom reminder added');
      setNewReminderName('');
      setNewReminderDescription('');
      setNewReminderInterval('3600');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add reminder');
    }
  };

  const handleToggleReminder = async (name: string, description: string, interval: bigint, currentEnabled: boolean) => {
    try {
      await updateReminder.mutateAsync({
        name,
        description,
        interval,
        enabled: !currentEnabled,
      });
      toast.success(currentEnabled ? 'Reminder disabled' : 'Reminder enabled');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update reminder');
    }
  };

  const handleRemoveReminder = async (name: string) => {
    try {
      await removeReminder.mutateAsync(name);
      toast.success('Reminder removed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove reminder');
    }
  };

  if (isLoading) {
    return (
      <Card className="border-2 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Loading reminders...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hydration Reminders */}
      <Card className="border-2 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Droplets className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle>Hydration Reminders</CardTitle>
              <CardDescription>Get notified to drink water throughout the day</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="hydration-reminder" className="text-base">
              Enable hydration reminders
            </Label>
            <Switch
              id="hydration-reminder"
              checked={hydrationEnabled}
              onCheckedChange={handleHydrationToggle}
            />
          </div>
        </CardContent>
      </Card>

      {/* Streak-Break Reminder */}
      <Card className="border-2 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning to-destructive flex items-center justify-center">
              <span className="text-xl">🔥</span>
            </div>
            <div>
              <CardTitle>Streak-Break Reminder</CardTitle>
              <CardDescription>Get warned before your streak breaks (when goal not met)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="streak-break-reminder" className="text-base">
              Enable streak-break reminders
            </Label>
            <Switch
              id="streak-break-reminder"
              checked={streakBreakEnabled}
              onCheckedChange={handleStreakBreakToggle}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sleep Reminders */}
      <Card className="border-2 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
              <Moon className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <CardTitle>Sleep Reminders</CardTitle>
              <CardDescription>Get reminded to log your sleep and maintain healthy habits</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="sleep-reminder" className="text-base">
              Enable sleep reminders
            </Label>
            <Switch
              id="sleep-reminder"
              checked={sleepEnabled}
              onCheckedChange={handleSleepToggle}
            />
          </div>
        </CardContent>
      </Card>

      {/* Custom Reminders */}
      <Card className="border-2 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Custom Reminders</CardTitle>
          <CardDescription>Create your own personalized reminders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reminder-name">Reminder Name</Label>
              <Input
                id="reminder-name"
                placeholder="e.g., Stretch Break"
                value={newReminderName}
                onChange={(e) => setNewReminderName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminder-description">Description</Label>
              <Input
                id="reminder-description"
                placeholder="e.g., Time to stretch and move around"
                value={newReminderDescription}
                onChange={(e) => setNewReminderDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminder-interval">Interval (seconds)</Label>
              <Input
                id="reminder-interval"
                type="number"
                placeholder="3600"
                value={newReminderInterval}
                onChange={(e) => setNewReminderInterval(e.target.value)}
              />
            </div>
            <Button
              onClick={handleAddReminder}
              disabled={addReminder.isPending}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              {addReminder.isPending ? 'Adding...' : 'Add Reminder'}
            </Button>
          </div>

          {reminders.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                {reminders.map((reminder) => (
                  <div
                    key={reminder.name}
                    className="flex items-center justify-between p-3 rounded-lg border bg-background/50"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{reminder.name}</div>
                      <div className="text-sm text-muted-foreground">{reminder.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Every {Number(reminder.intervalInNanos) / 1_000_000_000}s
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={reminder.enabled}
                        onCheckedChange={() =>
                          handleToggleReminder(
                            reminder.name,
                            reminder.description,
                            reminder.intervalInNanos,
                            reminder.enabled
                          )
                        }
                        disabled={updateReminder.isPending}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveReminder(reminder.name)}
                        disabled={removeReminder.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
