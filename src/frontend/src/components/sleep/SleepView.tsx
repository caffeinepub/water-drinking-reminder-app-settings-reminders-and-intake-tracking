import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import SleepLogForm from './SleepLogForm';
import SleepHistoryList from './SleepHistoryList';
import { Moon } from 'lucide-react';

export default function SleepView() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="w-5 h-5" />
            Sleep Tracker
          </CardTitle>
          <CardDescription>
            Log your sleep and track your rest patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SleepLogForm />
        </CardContent>
      </Card>

      <SleepHistoryList />
    </div>
  );
}
