import { useState, useEffect } from 'react';
import { useGetUserSettings, useUpdateUserSettings } from '../../hooks/useQueries';
import { useOfflinePreference } from '../../offline/useOfflinePreference';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Settings, Save, WifiOff } from 'lucide-react';

export default function SettingsForm() {
  const { data: settings, isLoading } = useGetUserSettings();
  const updateSettings = useUpdateUserSettings();
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
    
    const goalNum = parseFloat(dailyGoal);
    const cupNum = parseFloat(cupSize);
    
    if (isNaN(goalNum) || goalNum <= 0) {
      toast.error('Please enter a valid daily goal');
      return;
    }
    
    if (isNaN(cupNum) || cupNum <= 0) {
      toast.error('Please enter a valid cup size');
      return;
    }

    try {
      const result = await updateSettings.mutateAsync({
        dailyGoal: goalNum,
        cupSize: cupNum,
      });
      
      // Check if action was queued for offline
      if (result?.queued) {
        toast.success('Saved offline. Will sync when back online.', {
          description: 'Your settings will update when you reconnect',
        });
      } else {
        toast.success('Settings saved! Looking fresh! ✨', {
          description: 'Your preferences have been updated',
        });
      }
    } catch (error) {
      toast.error('Failed to save settings');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-2 shadow-lg">
        <CardContent className="pt-6">
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Settings
        </CardTitle>
        <CardDescription>
          Customize your hydration tracking experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dailyGoal">Daily Goal (ml)</Label>
              <Input
                id="dailyGoal"
                type="number"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(e.target.value)}
                min="100"
                step="100"
                required
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 2000-3000 ml per day
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cupSize">Default Cup Size (ml)</Label>
              <Input
                id="cupSize"
                type="number"
                value={cupSize}
                onChange={(e) => setCupSize(e.target.value)}
                min="50"
                step="50"
                required
              />
              <p className="text-xs text-muted-foreground">
                Your typical glass or bottle size
              </p>
            </div>

            <div className="pt-4 border-t">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="offline-mode" className="text-base font-semibold cursor-pointer">
                        Save for offline use
                      </Label>
                      <WifiOff className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      When enabled, your logs are saved locally when offline and automatically synced when you reconnect. 
                      Cached data from your last connection is shown while offline.
                    </p>
                  </div>
                  <Switch
                    id="offline-mode"
                    checked={offlineEnabled}
                    onCheckedChange={setOfflineEnabled}
                  />
                </div>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={updateSettings.isPending}
            className="w-full border-2 shadow-glow hover:shadow-glow-lg transition-all"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
