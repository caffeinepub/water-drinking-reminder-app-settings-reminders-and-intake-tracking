import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetAnalyticsMetrics, useGetAllUserAnalytics } from '../../hooks/useQueries';
import AdminAnalyticsSummary from './AdminAnalyticsSummary';
import AdminUserAnalyticsTable from './AdminUserAnalyticsTable';
import AdminDebugInfo from './AdminDebugInfo';
import { AlertCircle, ShieldAlert } from 'lucide-react';

interface AdminDashboardProps {
  isAdmin: boolean;
}

export default function AdminDashboard({ isAdmin }: AdminDashboardProps) {
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useGetAnalyticsMetrics();
  const { data: userAnalytics = [], isLoading: analyticsLoading, error: analyticsError } = useGetAllUserAnalytics();

  // Show unauthorized message for non-admins
  if (!isAdmin) {
    return (
      <Card className="border-2 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <ShieldAlert className="w-16 h-16 text-warning mx-auto" />
              <div>
                <p className="text-lg font-semibold text-foreground">Unauthorized Access</p>
                <p className="text-sm text-muted-foreground mt-2">
                  This section is only accessible to administrators.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isLoading = metricsLoading || analyticsLoading;
  const hasError = metricsError || analyticsError;

  // Check if error message indicates authorization issue
  const isAuthError = (error: any) => {
    const message = error?.message || '';
    return message.toLowerCase().includes('unauthorized') || message.toLowerCase().includes('only admins');
  };

  if (isLoading) {
    return (
      <Card className="border-2 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Loading admin dashboard...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasError) {
    const error = metricsError || analyticsError;
    const showUnauthorized = isAuthError(error);

    return (
      <Card className="border-2 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              {showUnauthorized ? (
                <>
                  <ShieldAlert className="w-16 h-16 text-warning mx-auto" />
                  <div>
                    <p className="text-lg font-semibold text-foreground">Unauthorized Access</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      You do not have permission to view admin data.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
                  <div>
                    <p className="text-lg font-semibold text-destructive">Failed to load admin data</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {error?.message || 'An error occurred'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card className="border-2 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-12">
            No metrics available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
          <CardDescription>View analytics and manage users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AdminAnalyticsSummary metrics={metrics} />
          <AdminUserAnalyticsTable userAnalytics={userAnalytics} />
        </CardContent>
      </Card>
      
      <AdminDebugInfo />
    </div>
  );
}
