import { RewardType } from '../../backend';
import { Droplet, Footprints, Moon, Leaf, Award } from 'lucide-react';

interface BadgeConfig {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  unlockAt: number;
}

const BADGE_CONFIG: Record<string, BadgeConfig> = {
  plastic_pirate: {
    name: 'Plastic Pirate',
    description: 'Complete 5 days in a row',
    icon: Leaf,
    color: 'text-green-500',
    unlockAt: 5,
  },
  runner: {
    name: 'Runner',
    description: 'Complete 10 days in a row',
    icon: Footprints,
    color: 'text-blue-500',
    unlockAt: 10,
  },
  hydrator: {
    name: 'Hydrator',
    description: 'Complete 15 days in a row',
    icon: Droplet,
    color: 'text-cyan-500',
    unlockAt: 15,
  },
  sleepyhead: {
    name: 'Sleepyhead',
    description: 'Complete 30 days in a row',
    icon: Moon,
    color: 'text-purple-500',
    unlockAt: 30,
  },
};

interface BadgesGridProps {
  badges: RewardType[];
}

export default function BadgesGrid({ badges }: BadgesGridProps) {
  // Ensure badges is an array
  const safeBadges = Array.isArray(badges) ? badges : [];

  // Get all possible badge types
  const allBadgeTypes = Object.keys(BADGE_CONFIG);

  return (
    <div className="grid grid-cols-2 gap-4">
      {allBadgeTypes.map((badgeType) => {
        const config = BADGE_CONFIG[badgeType];
        
        // Fallback for missing config (defensive)
        if (!config) {
          return (
            <div
              key={badgeType}
              className="bg-muted/50 rounded-xl p-4 border border-border/50 opacity-50"
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <Award className="w-12 h-12 text-muted-foreground" />
                <div>
                  <p className="font-semibold text-sm text-muted-foreground">Unknown Badge</p>
                  <p className="text-xs text-muted-foreground">Badge configuration missing</p>
                </div>
              </div>
            </div>
          );
        }

        const isUnlocked = safeBadges.some((badge) => {
          // RewardType is an enum, compare directly or convert to string
          const badgeKey = String(badge);
          return badgeKey === badgeType;
        });

        const Icon = config.icon;

        return (
          <div
            key={badgeType}
            className={`rounded-xl p-4 border transition-all ${
              isUnlocked
                ? 'bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 animate-confetti-pop'
                : 'bg-muted/50 border-border/50 opacity-50'
            }`}
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <Icon
                className={`w-12 h-12 ${
                  isUnlocked ? config.color : 'text-muted-foreground'
                }`}
              />
              <div>
                <p
                  className={`font-semibold text-sm ${
                    isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {config.name}
                </p>
                <p className="text-xs text-muted-foreground">{config.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
