import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Activity, TrendingUp, Droplets, Moon, Footprints } from 'lucide-react';
import type { AnalyticsMetrics } from '../../backend';
import { formatBigIntCount } from '../../utils/analyticsFormat';

interface AdminAnalyticsSummaryProps {
  metrics: AnalyticsMetrics;
}

export default function AdminAnalyticsSummary({ metrics }: AdminAnalyticsSummaryProps) {
  const summaryCards = [
    {
      title: 'Total Users',
      value: formatBigIntCount(metrics.totalUniqueUsers),
      icon: Users,
      gradient: 'from-primary to-accent',
    },
    {
      title: 'Daily Active Users',
      value: formatBigIntCount(metrics.dailyActiveUsers),
      icon: Activity,
      gradient: 'from-accent to-primary',
    },
    {
      title: 'Weekly Active Users',
      value: formatBigIntCount(metrics.weeklyActiveUsers),
      icon: TrendingUp,
      gradient: 'from-primary to-accent',
    },
  ];

  const featureCards = [
    {
      title: 'Hydration Events',
      value: formatBigIntCount(metrics.totalHydrationEvents),
      icon: Droplets,
      gradient: 'from-primary/80 to-accent/80',
    },
    {
      title: 'Sleep Events',
      value: formatBigIntCount(metrics.totalSleepEvents),
      icon: Moon,
      gradient: 'from-accent/80 to-primary/80',
    },
    {
      title: 'Running Events',
      value: formatBigIntCount(metrics.totalRunningEvents),
      icon: Footprints,
      gradient: 'from-primary/80 to-accent/80',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          User Activity Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {summaryCards.map((card) => (
            <Card key={card.title} className="border-2 shadow-sm hover:shadow-glow transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${card.gradient}`}>
                    <card.icon className="w-4 h-4 text-primary-foreground" />
                  </div>
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {card.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Feature Usage
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featureCards.map((card) => (
            <Card key={card.title} className="border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${card.gradient}`}>
                    <card.icon className="w-4 h-4 text-primary-foreground" />
                  </div>
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {card.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
