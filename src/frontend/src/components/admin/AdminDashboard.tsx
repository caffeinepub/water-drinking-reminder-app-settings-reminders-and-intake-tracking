import { useIsCallerAdmin, useGetAnalyticsMetrics, useGetAllUserAnalytics } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertCircle } from 'lucide-react';
import AdminAnalyticsSummary from './AdminAnalyticsSummary';
import AdminUserAnalyticsTable from './AdminUserAnalyticsTable';

export default function AdminDashboard() {
  const { data: isAdmin, isLoading: adminCheckLoading, error: adminCheckError } = useIsCallerAdmin();
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useGetAnalyticsMetrics();
  const { data: userAnalytics, isLoading: userAnalyticsLoading, error: userAnalyticsError } = useGetAllUserAnalytics();

  if (adminCheckLoading) {
    return (
      <div className="space-y-6">
        <Card className="border-2 shadow-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Admin Dashboard
            </CardTitle>
            <CardDescription>Verifying admin permissions...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (adminCheckError) {
    return (
      <div className="space-y-6">
        <Card className="border-2 shadow-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Admin Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Admin status could not be verified. Please check your connection and try again.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <Card className="border-2 shadow-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Admin Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You do not have permission to access the admin dashboard. This area is restricted to administrators only.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLoading = metricsLoading || userAnalyticsLoading;
  const hasError = metricsError || userAnalyticsError;

  return (
    <div className="space-y-6">
      <Card className="border-2 shadow-glow bg-gradient-to-br from-card via-card to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Shield className="w-6 h-6 text-primary" />
            Admin Dashboard
          </CardTitle>
          <CardDescription>Analytics and user activity overview</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {hasError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load analytics data. Please try again later.
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !hasError && metrics && userAnalytics && (
            <div className="space-y-8">
              <AdminAnalyticsSummary metrics={metrics} />
              <AdminUserAnalyticsTable userAnalytics={userAnalytics} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
