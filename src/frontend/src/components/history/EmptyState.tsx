import { Card, CardContent } from '@/components/ui/card';
import { Droplets, Sparkles } from 'lucide-react';

export default function EmptyState() {
  return (
    <Card className="border-2 shadow-lg">
      <CardContent className="pt-12 pb-12">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-dashed border-primary/30">
                <Droplets className="w-16 h-16 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-8 h-8 text-warning animate-pulse" />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-bold">No history yet!</h3>
            <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Start logging your water intake to track your progress, build streaks, and unlock cool badges! 💧✨
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
