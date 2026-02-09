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
import HistoryView from './components/history/HistoryView';
import SleepView from './components/sleep/SleepView';
import RunningView from './components/running/RunningView';
import { ReminderSchedulerProvider } from './hooks/useReminderSchedulerContext';
import { Droplets } from 'lucide-react';

export default function App() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <AppHeader />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <Droplets className="w-12 h-12 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight">Stay Healthy</h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Track your hydration, sleep, and running. Set personalized reminders and build healthy habits.
              </p>
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <AppHeader />
        <ProfileSetupModal open={showProfileSetup} />
        <InAppReminderBanner />
        
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="space-y-8">
            {/* Today's Progress Section */}
            <section className="space-y-4">
              <TodayProgress />
              <QuickAddIntake />
            </section>

            {/* Tabbed Interface */}
            <Tabs defaultValue="reminders" className="w-full">
              <TabsList className="grid w-full grid-cols-5 max-w-3xl mx-auto">
                <TabsTrigger value="reminders">Reminders</TabsTrigger>
                <TabsTrigger value="sleep">Sleep</TabsTrigger>
                <TabsTrigger value="running">Running</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
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

        <footer className="border-t mt-16 py-8">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>© 2026. Built with ❤️ using <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">caffeine.ai</a></p>
          </div>
        </footer>

        <Toaster />
      </div>
    </ReminderSchedulerProvider>
  );
}
