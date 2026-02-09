import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import AppHeader from './components/layout/AppHeader';
import LoginButton from './components/auth/LoginButton';
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
import OfflineBanner from './components/pwa/OfflineBanner';
import { ReminderSchedulerProvider } from './hooks/useReminderSchedulerContext';
import { OfflineSyncProvider } from './offline/OfflineSyncProvider';
import { Droplets, Sparkles } from 'lucide-react';

export default function App() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

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
            <div className="flex justify-center">
              <LoginButton />
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
          <p className="text-muted-foreground">Loading your vibe...</p>
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
          {/* Decorative background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-40 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-40 left-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
          </div>
          
          <AppHeader />
          <ProfileSetupModal open={showProfileSetup} />
          <InAppReminderBanner />
          <StreakBreakReminderController />
          
          <main className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
            <div className="space-y-8">
              {/* Today's Progress Section */}
              <section className="space-y-5">
                <TodayProgress />
                <QuickAddIntake />
                <RewardsPanel />
              </section>

              {/* Tabbed Interface */}
              <Tabs defaultValue="reminders" className="w-full">
                <TabsList className="grid w-full grid-cols-5 max-w-3xl mx-auto h-12 bg-card/80 backdrop-blur-sm border shadow-sm">
                  <TabsTrigger value="reminders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Reminders
                  </TabsTrigger>
                  <TabsTrigger value="sleep" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Sleep
                  </TabsTrigger>
                  <TabsTrigger value="running" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Running
                  </TabsTrigger>
                  <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    History
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Settings
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="reminders" className="mt-6">
                  <ReminderControls />
                </TabsContent>

                <TabsContent value="sleep" className="mt-6">
                  <SleepView />
                </TabsContent>

                <TabsContent value="running" className="mt-6">
                  <RunningView />
                </TabsContent>
                
                <TabsContent value="history" className="mt-6">
                  <HistoryView />
                </TabsContent>
                
                <TabsContent value="settings" className="mt-6">
                  <SettingsForm />
                </TabsContent>
              </Tabs>
            </div>
          </main>

          <footer className="border-t mt-20 py-8 bg-card/30 backdrop-blur-sm relative z-10">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
              <p>© 2026. Built with ❤️ using <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">caffeine.ai</a></p>
            </div>
          </footer>

          <Toaster />
        </div>
      </OfflineSyncProvider>
    </ReminderSchedulerProvider>
  );
}
