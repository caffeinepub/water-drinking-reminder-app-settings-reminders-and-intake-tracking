import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import RunLogForm from './RunLogForm';
import RunHistoryList from './RunHistoryList';
import { Activity } from 'lucide-react';

export default function RunningView() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Running Tracker
          </CardTitle>
          <CardDescription>
            Log your runs and track your progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RunLogForm />
        </CardContent>
      </Card>

      <RunHistoryList />
    </div>
  );
}
