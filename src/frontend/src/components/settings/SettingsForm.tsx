import { useState, useEffect } from 'react';
import { useGetUserSettings, useUpdateUserSettings } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Settings, Save } from 'lucide-react';

export default function SettingsForm() {
  const { data: settings, isLoading } = useGetUserSettings();
  const updateSettings = useUpdateUserSettings();

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
      toast.error('Please enter a valid daily goal');
      return;
    }

    if (isNaN(cupValue) || cupValue <= 0) {
      toast.error('Please enter a valid cup size');
      return;
    }

    try {
      await updateSettings.mutateAsync({
        dailyGoal: goalValue,
        cupSize: cupValue,
      });
      toast.success('Settings saved! ✨', {
        description: 'Your preferences have been updated',
      });
    } catch (error) {
      toast.error('Failed to save settings', {
        description: 'Please try again',
      });
      console.error('Settings update error:', error);
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
          Customize your hydration tracking preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="dailyGoal" className="text-sm font-medium">
              Daily Water Goal (ml)
            </Label>
            <Input
              id="dailyGoal"
              type="number"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(e.target.value)}
              placeholder="2000"
              className="border-2"
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 2000-3000 ml per day
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cupSize" className="text-sm font-medium">
              Default Cup Size (ml)
            </Label>
            <Input
              id="cupSize"
              type="number"
              value={cupSize}
              onChange={(e) => setCupSize(e.target.value)}
              placeholder="250"
              className="border-2"
            />
            <p className="text-xs text-muted-foreground">
              Used for quick-add "1 Cup" button
            </p>
          </div>

          <Button
            type="submit"
            disabled={updateSettings.isPending}
            className="w-full shadow-md hover:shadow-glow transition-all"
          >
            {updateSettings.isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Settings
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
