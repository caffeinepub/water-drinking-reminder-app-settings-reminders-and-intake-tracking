import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useReminderScheduler } from '../../hooks/useReminderSchedulerContext';
import { useListCustomReminders, useAddCustomReminder, useUpdateCustomReminder, useRemoveCustomReminder } from '../../hooks/useQueries';
import { Bell, BellOff, Play, Pause, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ReminderControls() {
  const {
    isRunning,
    notificationPermission,
    requestPermission,
    startReminders,
    pauseReminders,
  } = useReminderScheduler();

  const { data: customReminders = [], isLoading } = useListCustomReminders();
  const addReminder = useAddCustomReminder();
  const updateReminder = useUpdateCustomReminder();
  const removeReminder = useRemoveCustomReminder();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newReminderName, setNewReminderName] = useState('');
  const [newReminderDescription, setNewReminderDescription] = useState('');
  const [newReminderInterval, setNewReminderInterval] = useState('60');

  const getPermissionBadge = () => {
    switch (notificationPermission) {
      case 'granted':
        return <Badge variant="default" className="gap-1"><Bell className="w-3 h-3" /> Enabled</Badge>;
      case 'denied':
        return <Badge variant="destructive" className="gap-1"><BellOff className="w-3 h-3" /> Blocked</Badge>;
      default:
        return <Badge variant="secondary" className="gap-1"><Bell className="w-3 h-3" /> Not Set</Badge>;
    }
  };

  const handleAddReminder = async () => {
    if (!newReminderName.trim()) {
      toast.error('Please enter a reminder name');
      return;
    }

    const intervalMinutes = parseInt(newReminderInterval);
    if (isNaN(intervalMinutes) || intervalMinutes <= 0) {
      toast.error('Please enter a valid interval in minutes');
      return;
    }

    try {
      await addReminder.mutateAsync({
        name: newReminderName.trim(),
        description: newReminderDescription.trim(),
        interval: BigInt(intervalMinutes * 60 * 1000000000),
        enabled: true,
      });
      toast.success('Custom reminder added');
      setIsDialogOpen(false);
      setNewReminderName('');
      setNewReminderDescription('');
      setNewReminderInterval('60');
    } catch (error) {
      toast.error('Failed to add reminder');
      console.error(error);
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
    } catch (error) {
      toast.error('Failed to update reminder');
      console.error(error);
    }
  };

  const handleRemoveReminder = async (name: string) => {
    try {
      await removeReminder.mutateAsync(name);
      toast.success('Reminder removed');
    } catch (error) {
      toast.error('Failed to remove reminder');
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Hydration Reminders
          </CardTitle>
          <CardDescription>
            Manage your hydration reminders and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Browser Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Get notified even when the app is in the background
                </p>
              </div>
              {getPermissionBadge()}
            </div>

            {notificationPermission !== 'granted' && (
              <Button
                onClick={requestPermission}
                variant="outline"
                className="w-full"
              >
                <Bell className="w-4 h-4 mr-2" />
                Enable Notifications
              </Button>
            )}
          </div>

          <div className="pt-4 border-t space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Reminder Status</Label>
                <p className="text-xs text-muted-foreground">
                  {isRunning ? 'Reminders are active' : 'Reminders are paused'}
                </p>
              </div>
              <Switch
                checked={isRunning}
                onCheckedChange={(checked) => {
                  if (checked) {
                    startReminders();
                  } else {
                    pauseReminders();
                  }
                }}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={startReminders}
                disabled={isRunning}
                variant="default"
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Start
              </Button>
              <Button
                onClick={pauseReminders}
                disabled={!isRunning}
                variant="outline"
                className="flex-1"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              💡 Tip: Reminders will only trigger when the app is open. For best results, keep this tab open or pinned.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Custom Reminders
              </CardTitle>
              <CardDescription>
                Create personalized health reminders
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Custom Reminder</DialogTitle>
                  <DialogDescription>
                    Create a new health reminder with a custom schedule
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Reminder Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Take Vitamins"
                      value={newReminderName}
                      onChange={(e) => setNewReminderName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Input
                      id="description"
                      placeholder="e.g., Take daily multivitamin"
                      value={newReminderDescription}
                      onChange={(e) => setNewReminderDescription(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interval">Interval (minutes)</Label>
                    <Input
                      id="interval"
                      type="number"
                      min="1"
                      placeholder="60"
                      value={newReminderInterval}
                      onChange={(e) => setNewReminderInterval(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
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
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : customReminders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No custom reminders yet</p>
              <p className="text-xs mt-1">Click "Add" to create your first reminder</p>
            </div>
          ) : (
            <div className="space-y-3">
              {customReminders.map((reminder) => (
                <div key={reminder.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{reminder.name}</p>
                      <Badge variant={reminder.enabled ? 'default' : 'secondary'} className="text-xs">
                        {reminder.enabled ? 'Active' : 'Paused'}
                      </Badge>
                    </div>
                    {reminder.description && (
                      <p className="text-xs text-muted-foreground">{reminder.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Every {Number(reminder.intervalInNanos) / 60000000000} minutes
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={reminder.enabled}
                      onCheckedChange={() => handleToggleReminder(reminder.name, reminder.description, reminder.intervalInNanos, reminder.enabled)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
