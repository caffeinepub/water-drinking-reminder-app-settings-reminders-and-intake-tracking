import { useReminderScheduler } from '../../hooks/useReminderSchedulerContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Droplets, Moon, Activity, Bell, X, Flame } from 'lucide-react';

export default function InAppReminderBanner() {
  const { showInAppReminder, dismissReminder } = useReminderScheduler();

  if (!showInAppReminder) return null;

  const getIcon = () => {
    switch (showInAppReminder.type) {
      case 'hydration':
        return <Droplets className="h-5 w-5" />;
      case 'sleep':
        return <Moon className="h-5 w-5" />;
      case 'streak-break':
        return <Flame className="h-5 w-5" />;
      case 'custom':
        return <Bell className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in slide-in-from-top-5">
      <Alert className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-2 border-primary shadow-glow-lg">
        {getIcon()}
        <AlertDescription className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base break-words">{showInAppReminder.title}</p>
            <p className="text-sm opacity-95 mt-1 break-words">{showInAppReminder.body}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-primary-foreground/20 shrink-0 rounded-full"
            onClick={dismissReminder}
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
