import { useReminderScheduler } from '../../hooks/useReminderSchedulerContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Droplets, Moon, Activity, Bell, X } from 'lucide-react';

export default function InAppReminderBanner() {
  const { showInAppReminder, dismissReminder } = useReminderScheduler();

  if (!showInAppReminder) return null;

  const getIcon = () => {
    switch (showInAppReminder.type) {
      case 'hydration':
        return <Droplets className="h-5 w-5" />;
      case 'sleep':
        return <Moon className="h-5 w-5" />;
      case 'custom':
        return <Bell className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in slide-in-from-top-5">
      <Alert className="bg-primary text-primary-foreground border-primary shadow-lg">
        {getIcon()}
        <AlertDescription className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">{showInAppReminder.title}</p>
            <p className="text-xs opacity-90 mt-0.5">{showInAppReminder.body}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-primary-foreground/20 shrink-0"
            onClick={dismissReminder}
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
