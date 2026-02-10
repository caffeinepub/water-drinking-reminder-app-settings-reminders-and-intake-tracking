import { useState, useEffect } from 'react';
import { useGetUserSettings, useUpdateUserSettings } from '../../hooks/useQueries';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useOfflinePreference } from '../../offline/useOfflinePreference';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Droplet, Coffee } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeBackendError } from '../../utils/backendError';

export default function SettingsForm() {
  const { data: settings, isLoading } = useGetUserSettings();
  const updateMutation = useUpdateUserSettings();
  const isOnline = useOnlineStatus();
  const { enabled: offlineEnabled, setEnabled: setOfflineEnabled } = useOfflinePreference();

  const [dailyGoal, setDailyGoal] = useState('2000');
  const [cupSize, setCupSize] = useState('250');

  useEffect(() => {
    if (settings) {
      setDailyGoal(settings.dailyGoal.toString());
      setCupSize(settings.cupSize.toString());
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const goalValue = parseFloat(dailyGoal);
    const cupValue = parseFloat(cupSize);

    if (isNaN(goalValue) || goalValue <= 0) {
      toast.error('Invalid daily goal', {
        description: 'Please enter a valid number greater than 0.',
      });
      return;
    }

    if (isNaN(cupValue) || cupValue <= 0) {
      toast.error('Invalid cup size', {
        description: 'Please enter a valid number greater than 0.',
      });
      return;
    }

    if (!isOnline) {
      toast.info('Queued for sync', {
        description: 'Your settings will be saved when you\'re back online.',
      });
    }

    try {
      await updateMutation.mutateAsync({
        dailyGoal: goalValue,
        cupSize: cupValue,
      });

      if (isOnline) {
        toast.success('Settings saved!', {
          description: 'Your preferences have been updated.',
        });
      }
    } catch (error) {
      const errorMessage = normalizeBackendError(error);
      toast.error('Failed to save settings', {
        description: errorMessage,
      });
      console.error('Error updating settings:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-2 shadow-lg">
        <CardContent className="pt-6">
          <div className="h-32 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dailyGoal" className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-primary" />
                Daily Goal (ml)
              </Label>
              <Input
                id="dailyGoal"
                type="number"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(e.target.value)}
                placeholder="2000"
                min="1"
                step="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cupSize" className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-primary" />
                Default Cup Size (ml)
              </Label>
              <Input
                id="cupSize"
                type="number"
                value={cupSize}
                onChange={(e) => setCupSize(e.target.value)}
                placeholder="250"
                min="1"
                step="50"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border-2">
              <div className="space-y-0.5">
                <Label htmlFor="offline-mode" className="text-sm font-medium">
                  Save for offline use
                </Label>
                <p className="text-xs text-muted-foreground">
                  Cache data locally and queue actions when offline
                </p>
              </div>
              <Switch
                id="offline-mode"
                checked={offlineEnabled}
                onCheckedChange={setOfflineEnabled}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
