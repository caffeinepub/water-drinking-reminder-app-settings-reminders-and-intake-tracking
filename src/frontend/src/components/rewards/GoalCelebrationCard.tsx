import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Trophy, PartyPopper } from 'lucide-react';

export default function GoalCelebrationCard() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <Card className="max-w-md mx-4 border-4 border-success shadow-glow-lg animate-confetti-pop pointer-events-auto bg-gradient-to-br from-success/20 to-warning/20">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="flex justify-center gap-3">
            <PartyPopper className="w-12 h-12 text-warning animate-bounce" />
            <Trophy className="w-16 h-16 text-success animate-pulse" />
            <Sparkles className="w-12 h-12 text-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-success via-warning to-primary bg-clip-text text-transparent">
              Goal Crushed! 🎉
            </h2>
            <p className="text-lg font-medium text-foreground">
              You hit your daily hydration goal!
            </p>
            <p className="text-sm text-muted-foreground">
              Your streak is safe and you're absolutely killing it! Keep this energy! 💪✨
            </p>
          </div>

          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/20 border-2 border-success/40 rounded-full">
              <span className="text-2xl">🔥</span>
              <span className="text-sm font-bold text-success">Streak saved!</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
