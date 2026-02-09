import { useReminderScheduler } from '../../hooks/useReminderScheduler';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Droplets, X } from 'lucide-react';

export default function InAppReminderBanner() {
  const { showInAppReminder, dismissReminder } = useReminderScheduler();

  if (!showInAppReminder) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in slide-in-from-top-5">
      <Alert className="bg-primary text-primary-foreground border-primary shadow-lg">
        <Droplets className="h-5 w-5" />
        <AlertDescription className="flex items-center justify-between gap-4">
          <span className="font-medium">Time to hydrate! 💧</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-primary-foreground/20"
            onClick={dismissReminder}
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
