import { useGetCallerUserProfile } from '../../hooks/useQueries';
import LoginButton from '../auth/LoginButton';
import InstallAppButton from '../pwa/InstallAppButton';
import { Droplets, Sparkles } from 'lucide-react';

export default function AppHeader() {
  const { data: userProfile } = useGetCallerUserProfile();

  return (
    <header className="border-b bg-card/60 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                <Droplets className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="w-4 h-4 text-warning" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Hydration Tracker
              </h1>
              {userProfile && (
                <p className="text-sm text-muted-foreground">Hey, {userProfile.name}! 👋</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <InstallAppButton />
            <LoginButton />
          </div>
        </div>
      </div>
    </header>
  );
}
