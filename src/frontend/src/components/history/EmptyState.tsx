import { Card, CardContent } from '@/components/ui/card';
import { Droplets } from 'lucide-react';

export default function EmptyState() {
  return (
    <Card>
      <CardContent className="pt-12 pb-12">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
              <Droplets className="w-16 h-16 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">No intake history yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Start logging your water intake to see your hydration history and track your progress over time.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
