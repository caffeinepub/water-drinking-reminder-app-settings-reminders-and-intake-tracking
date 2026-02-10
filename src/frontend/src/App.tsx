import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from './hooks/useQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import AppHeader from './components/layout/AppHeader';
import LoginButton from './components/auth/LoginButton';
import LoginShareLink from './components/auth/LoginShareLink';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import TodayProgress from './components/intake/TodayProgress';
import QuickAddIntake from './components/intake/QuickAddIntake';
import SettingsForm from './components/settings/SettingsForm';
import ReminderControls from './components/reminders/ReminderControls';
import InAppReminderBanner from './components/reminders/InAppReminderBanner';
import StreakBreakReminderController from './components/reminders/StreakBreakReminderController';
import HistoryView from './components/history/HistoryView';
import SleepView from './components/sleep/SleepView';
import RunningView from './components/running/RunningView';
import RewardsPanel from './components/rewards/RewardsPanel';
import AdminDashboard from './components/admin/AdminDashboard';
import OfflineBanner from './components/pwa/OfflineBanner';
import { ReminderSchedulerProvider } from './hooks/useReminderSchedulerContext';
import { OfflineSyncProvider } from './offline/OfflineSyncProvider';
import { Droplets, Sparkles, ShieldAlert } from 'lucide-react';

export default function App() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 relative overflow-hidden">
        <OfflineBanner />
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>
        
        <AppHeader />
        <main className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-10">
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow-lg animate-pulse-glow">
                    <Droplets className="w-16 h-16 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="w-8 h-8 text-warning animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Stay Hydrated, Stay Vibing ✨
                </h1>
                <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Track your water, sleep, and runs. Earn badges, build streaks, and keep your body happy. Let's get it! 💧
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4">
              <LoginButton />
              <LoginShareLink />
            </div>
          </div>
        </main>
        <Toaster />
      </div>
    );
  }

  if (profileLoading || !isFetched) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 flex items-center justify-center">
        <OfflineBanner />
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <ReminderSchedulerProvider>
      <OfflineSyncProvider>
        <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 relative overflow-hidden">
          <OfflineBanner />
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          </div>

          <AppHeader />
          <InAppReminderBanner />
          <StreakBreakReminderController />

          <main className="container mx-auto px-4 py-8 relative z-10">
            <div className="max-w-4xl mx-auto space-y-8">
              <Tabs defaultValue="today" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 gap-2 h-auto p-2 bg-card/50 backdrop-blur-sm border-2 shadow-lg">
                  <TabsTrigger value="today" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Today
                  </TabsTrigger>
                  <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    History
                  </TabsTrigger>
                  <TabsTrigger value="sleep" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Sleep
                  </TabsTrigger>
                  <TabsTrigger value="running" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Running
                  </TabsTrigger>
                  <TabsTrigger value="rewards" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Rewards
                  </TabsTrigger>
                  <TabsTrigger value="reminders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Reminders
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Settings
                  </TabsTrigger>
                  {isAdmin && (
                    <TabsTrigger value="admin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground col-span-3 lg:col-span-1">
                      Admin
                    </TabsTrigger>
                  )}
                  {!isAdmin && !adminLoading && (
                    <TabsTrigger 
                      value="admin" 
                      disabled 
                      className="col-span-3 lg:col-span-1 opacity-50 cursor-not-allowed"
                      title="Admin access only"
                    >
                      <ShieldAlert className="w-4 h-4 mr-1" />
                      Admin
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="today" className="space-y-6 mt-6">
                  <TodayProgress />
                  <QuickAddIntake />
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                  <HistoryView />
                </TabsContent>

                <TabsContent value="sleep" className="mt-6">
                  <SleepView />
                </TabsContent>

                <TabsContent value="running" className="mt-6">
                  <RunningView />
                </TabsContent>

                <TabsContent value="rewards" className="mt-6">
                  <RewardsPanel />
                </TabsContent>

                <TabsContent value="reminders" className="mt-6">
                  <ReminderControls />
                </TabsContent>

                <TabsContent value="settings" className="space-y-6 mt-6">
                  <SettingsForm />
                </TabsContent>

                <TabsContent value="admin" className="mt-6">
                  <AdminDashboard isAdmin={isAdmin || false} />
                </TabsContent>
              </Tabs>
            </div>
          </main>

          <footer className="relative z-10 py-8 mt-16 border-t border-border/50 bg-card/30 backdrop-blur-sm">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
              <p>
                © {new Date().getFullYear()} • Built with ❤️ using{' '}
                <a
                  href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                    typeof window !== 'undefined' ? window.location.hostname : 'hydration-tracker'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  caffeine.ai
                </a>
              </p>
            </div>
          </footer>

          <ProfileSetupModal open={showProfileSetup} />
          <Toaster />
        </div>
      </OfflineSyncProvider>
    </ReminderSchedulerProvider>
  );
}
