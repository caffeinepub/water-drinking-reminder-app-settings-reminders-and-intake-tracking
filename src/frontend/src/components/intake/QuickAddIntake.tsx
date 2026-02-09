import { useState } from 'react';
import { useAddDailyIntake, useGetUserSettings } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Droplet } from 'lucide-react';

export default function QuickAddIntake() {
  const [customAmount, setCustomAmount] = useState('');
  const { data: settings } = useGetUserSettings();
  const addIntake = useAddDailyIntake();

  const cupSize = settings?.cupSize || 250;

  const handleQuickAdd = async (amount: number) => {
    try {
      await addIntake.mutateAsync(amount);
      toast.success(`Added ${amount} ml to your daily intake`);
    } catch (error) {
      toast.error('Failed to add intake. Please try again.');
      console.error('Add intake error:', error);
    }
  };

  const handleCustomAdd = async () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    await handleQuickAdd(amount);
    setCustomAmount('');
  };

  const quickAddOptions = [
    { label: '1 Cup', amount: cupSize },
    { label: '250 ml', amount: 250 },
    { label: '500 ml', amount: 500 },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Log Water Intake
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {quickAddOptions.map((option) => (
            <Button
              key={option.label}
              variant="outline"
              onClick={() => handleQuickAdd(option.amount)}
              disabled={addIntake.isPending}
              className="h-auto py-3 flex flex-col gap-1"
            >
              <Droplet className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium">{option.label}</span>
              <span className="text-xs text-muted-foreground">{option.amount} ml</span>
            </Button>
          ))}
        </div>

        <div className="space-y-2 pt-2 border-t">
          <Label htmlFor="custom-amount">Custom Amount (ml)</Label>
          <div className="flex gap-2">
            <Input
              id="custom-amount"
              type="number"
              placeholder="Enter amount"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCustomAdd();
                }
              }}
            />
            <Button
              onClick={handleCustomAdd}
              disabled={addIntake.isPending || !customAmount}
            >
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
