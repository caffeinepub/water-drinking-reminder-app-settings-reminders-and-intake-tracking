import { useState, useEffect } from 'react';
import { useGetUserSettings, useUpdateUserSettings } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Settings } from 'lucide-react';

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
      toast.error('Daily goal must be a positive number');
      return;
    }

    if (isNaN(cupValue) || cupValue <= 0) {
      toast.error('Cup size must be a positive number');
      return;
    }

    if (goalValue > 10000) {
      toast.error('Daily goal seems too high. Please enter a realistic value.');
      return;
    }

    if (cupValue > 2000) {
      toast.error('Cup size seems too large. Please enter a realistic value.');
      return;
    }

    try {
      await updateSettings.mutateAsync({
        dailyGoal: goalValue,
        cupSize: cupValue,
      });
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings. Please try again.');
      console.error('Settings save error:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Hydration Settings
        </CardTitle>
        <CardDescription>
          Customize your daily water intake goals and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="dailyGoal">Daily Water Goal (ml)</Label>
            <Input
              id="dailyGoal"
              type="number"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(e.target.value)}
              placeholder="2000"
              min="100"
              max="10000"
              step="100"
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
              placeholder="250"
              min="50"
              max="2000"
              step="50"
            />
            <p className="text-xs text-muted-foreground">
              Used for quick-add "1 Cup" button
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={updateSettings.isPending}>
            {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
