import { usePWAInstallPrompt } from '../../hooks/usePWAInstallPrompt';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export default function InstallAppButton() {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstallPrompt();

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) {
      toast.success('App installed! Check your home screen or app drawer.');
    }
  };

  // Don't show if already installed or not installable
  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <Button
      onClick={handleInstall}
      variant="outline"
      size="sm"
      className="gap-2 border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all"
    >
      <Download className="w-4 h-4" />
      <span className="hidden sm:inline">Install App</span>
    </Button>
  );
}
