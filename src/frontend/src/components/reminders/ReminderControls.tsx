import { useState, useEffect } from 'react';
import { useReminderScheduler } from '../../hooks/useReminderSchedulerContext';
import { useListCustomReminders, useAddCustomReminder, useUpdateCustomReminder, useRemoveCustomReminder } from '../../hooks/useQueries';
import { getStreakBreakSettings, setStreakBreakSettings } from '../../hooks/useStreakBreakReminder';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Bell, BellOff, Plus, Trash2, Droplets, Flame } from 'lucide-react';

export default function ReminderControls() {
  const { isRunning, notificationPermission, requestPermission, startReminders, pauseReminders } = useReminderScheduler();
  const { data: customReminders = [], isLoading } = useListCustomReminders();
  const addReminder = useAddCustomReminder();
  const updateReminder = useUpdateCustomReminder();
  const removeReminder = useRemoveCustomReminder();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newReminderName, setNewReminderName] = useState('');
  const [newReminderDescription, setNewReminderDescription] = useState('');
  const [newReminderInterval, setNewReminderInterval] = useState('60');

  // Streak-break reminder state
  const [streakBreakEnabled, setStreakBreakEnabled] = useState(false);
  const [streakBreakHours, setStreakBreakHours] = useState('2');

  useEffect(() => {
    const settings = getStreakBreakSettings();
    setStreakBreakEnabled(settings.enabled);
    setStreakBreakHours(String(settings.warningHours));
  }, []);

  const handleToggleReminders = () => {
    if (isRunning) {
      pauseReminders();
    } else {
      if (notificationPermission === 'default') {
        requestPermission().then(() => {
          startReminders();
        });
      } else {
        startReminders();
      }
    }
  };

  const handleAddReminder = async () => {
    if (!newReminderName.trim()) {
      toast.error('Please enter a reminder name');
      return;
    }

    const intervalMinutes = parseInt(newReminderInterval);
    if (isNaN(intervalMinutes) || intervalMinutes <= 0) {
      toast.error('Please enter a valid interval');
      return;
    }

    try {
      await addReminder.mutateAsync({
        name: newReminderName,
        description: newReminderDescription,
        interval: BigInt(intervalMinutes * 60 * 1000000000),
        enabled: true,
      });
      toast.success('Reminder added! 🔔');
      setIsAddDialogOpen(false);
      setNewReminderName('');
      setNewReminderDescription('');
      setNewReminderInterval('60');
    } catch (error) {
      toast.error('Failed to add reminder');
      console.error('Add reminder error:', error);
    }
  };

  const handleToggleReminder = async (name: string, currentEnabled: boolean) => {
    const reminder = customReminders.find(r => r.name === name);
    if (!reminder) return;

    try {
      await updateReminder.mutateAsync({
        name: reminder.name,
        description: reminder.description,
        interval: reminder.intervalInNanos,
        enabled: !currentEnabled,
      });
      toast.success(currentEnabled ? 'Reminder paused' : 'Reminder enabled! 🔔');
    } catch (error) {
      toast.error('Failed to update reminder');
      console.error('Update reminder error:', error);
    }
  };

  const handleRemoveReminder = async (name: string) => {
    try {
      await removeReminder.mutateAsync(name);
      toast.success('Reminder removed');
    } catch (error) {
      toast.error('Failed to remove reminder');
      console.error('Remove reminder error:', error);
    }
  };

  const handleStreakBreakToggle = (enabled: boolean) => {
    setStreakBreakEnabled(enabled);
    const hours = parseInt(streakBreakHours) || 2;
    setStreakBreakSettings(enabled, hours);
    toast.success(enabled ? 'Streak-break reminders enabled! 🔥' : 'Streak-break reminders disabled');
  };

  const handleStreakBreakHoursChange = (value: string) => {
    setStreakBreakHours(value);
    const hours = parseInt(value);
    if (!isNaN(hours) && hours > 0) {
      setStreakBreakSettings(streakBreakEnabled, hours);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hydration Reminders Card */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-primary" />
            Hydration Reminders
          </CardTitle>
          <CardDescription>
            Get chill reminders to stay hydrated throughout the day
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border-2">
            <div className="space-y-1">
              <p className="font-semibold">Hydration Notifications</p>
              <p className="text-sm text-muted-foreground">
                {isRunning ? "Active - you'll get reminded! 🔔" : 'Paused - no reminders for now'}
              </p>
              {notificationPermission === 'denied' && (
                <p className="text-xs text-warning">Browser notifications blocked - using in-app only</p>
              )}
            </div>
            <Button
              onClick={handleToggleReminders}
              variant={isRunning ? 'outline' : 'default'}
              className="shadow-md hover:shadow-glow transition-all"
            >
              {isRunning ? (
                <>
                  <BellOff className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Start
                </>
              )}
            </Button>
          </div>

          {notificationPermission === 'default' && (
            <div className="p-3 bg-muted/50 rounded-xl border-2 border-dashed">
              <p className="text-sm text-muted-foreground text-center">
                Enable browser notifications for the best experience! 🔔
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Streak-Break Reminder Card */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-warning" />
            Streak-Break Reminder
          </CardTitle>
          <CardDescription>
            Get a heads-up when your streak is at risk near end of day
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-warning/5 to-destructive/5 rounded-2xl border-2">
            <div className="space-y-1 flex-1">
              <p className="font-semibold">Streak Protection</p>
              <p className="text-sm text-muted-foreground">
                {streakBreakEnabled ? "Active - we'll remind you! 🔥" : 'Disabled - no streak reminders'}
              </p>
            </div>
            <Switch
              checked={streakBreakEnabled}
              onCheckedChange={handleStreakBreakToggle}
            />
          </div>

          {streakBreakEnabled && (
            <div className="space-y-2 p-4 bg-muted/30 rounded-xl border-2">
              <Label htmlFor="warning-hours" className="text-sm font-medium">
                Warning Window (hours before end of day)
              </Label>
              <Input
                id="warning-hours"
                type="number"
                min="1"
                max="12"
                value={streakBreakHours}
                onChange={(e) => handleStreakBreakHoursChange(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                You'll get reminded {streakBreakHours} hour{parseInt(streakBreakHours) !== 1 ? 's' : ''} before midnight if your goal isn't met
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Reminders Card */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Custom Reminders
              </CardTitle>
              <CardDescription>
                Create your own personalized reminders
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="shadow-md">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Custom Reminder</DialogTitle>
                  <DialogDescription>
                    Create a new reminder with your own schedule
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Reminder Name</Label>
                    <Input
                      id="name"
                      value={newReminderName}
                      onChange={(e) => setNewReminderName(e.target.value)}
                      placeholder="e.g., Stretch Break"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Input
                      id="description"
                      value={newReminderDescription}
                      onChange={(e) => setNewReminderDescription(e.target.value)}
                      placeholder="e.g., Time to stretch!"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interval">Interval (minutes)</Label>
                    <Input
                      id="interval"
                      type="number"
                      value={newReminderInterval}
                      onChange={(e) => setNewReminderInterval(e.target.value)}
                      placeholder="60"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddReminder} disabled={addReminder.isPending}>
                    {addReminder.isPending ? 'Adding...' : 'Add Reminder'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-32 flex items-center justify-center">
              <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : customReminders.length === 0 ? (
            <div className="text-center py-8 px-4 bg-muted/30 rounded-xl border-2 border-dashed">
              <p className="text-sm text-muted-foreground">
                No custom reminders yet. Create one to get started! 🔔
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {customReminders.map((reminder) => (
                <div
                  key={reminder.name}
                  className="flex items-center justify-between p-4 bg-card border-2 rounded-2xl hover:shadow-md transition-all"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold truncate">{reminder.name}</p>
                      <Badge variant={reminder.enabled ? 'default' : 'secondary'} className="shrink-0">
                        {reminder.enabled ? 'Active' : 'Paused'}
                      </Badge>
                    </div>
                    {reminder.description && (
                      <p className="text-sm text-muted-foreground truncate">{reminder.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Every {Number(reminder.intervalInNanos) / 60000000000} minutes
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={reminder.enabled}
                      onCheckedChange={() => handleToggleReminder(reminder.name, reminder.enabled)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveReminder(reminder.name)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
