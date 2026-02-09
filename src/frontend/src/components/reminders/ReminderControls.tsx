import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useReminderScheduler } from '../../hooks/useReminderScheduler';
import { Bell, BellOff, Play, Pause } from 'lucide-react';

export default function ReminderControls() {
  const {
    isRunning,
    notificationPermission,
    requestPermission,
    startReminders,
    pauseReminders,
  } = useReminderScheduler();

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Reminder Controls
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
  );
}
