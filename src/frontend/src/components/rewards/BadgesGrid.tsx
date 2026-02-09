import { RewardType } from '../../backend';
import { Badge } from '@/components/ui/badge';
import { Droplets, Footprints, Moon, Recycle } from 'lucide-react';

interface BadgesGridProps {
  badges: RewardType[];
}

const BADGE_CONFIG = {
  [RewardType.hydrator]: {
    name: 'Hydrator',
    icon: Droplets,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
    description: 'Hydration master',
  },
  [RewardType.runner]: {
    name: 'Runner',
    icon: Footprints,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    borderColor: 'border-chart-2/30',
    description: 'Running champion',
  },
  [RewardType.sleepyhead]: {
    name: 'Sleepyhead',
    icon: Moon,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    borderColor: 'border-chart-4/30',
    description: 'Sleep expert',
  },
  [RewardType.plastic_pirate]: {
    name: 'Eco Warrior',
    icon: Recycle,
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
    description: 'Planet protector',
  },
};

export default function BadgesGrid({ badges }: BadgesGridProps) {
  const allBadgeTypes = Object.values(RewardType);

  return (
    <div className="grid grid-cols-4 gap-3">
      {allBadgeTypes.map((badgeType) => {
        const isUnlocked = badges.includes(badgeType);
        const config = BADGE_CONFIG[badgeType];
        const Icon = config.icon;

        return (
          <div
            key={badgeType}
            className={`
              relative p-3 rounded-2xl border-2 transition-all duration-300
              ${isUnlocked 
                ? `${config.bgColor} ${config.borderColor} shadow-md hover:shadow-glow` 
                : 'bg-muted/30 border-muted/50 opacity-50'
              }
            `}
          >
            <div className="flex flex-col items-center gap-2">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                ${isUnlocked ? config.bgColor : 'bg-muted/50'}
                ${isUnlocked ? 'animate-confetti-pop' : ''}
              `}>
                <Icon className={`w-6 h-6 ${isUnlocked ? config.color : 'text-muted-foreground'}`} />
              </div>
              <div className="text-center">
                <p className={`text-xs font-semibold ${isUnlocked ? config.color : 'text-muted-foreground'}`}>
                  {config.name}
                </p>
              </div>
              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-muted/80 flex items-center justify-center">
                    <span className="text-lg">🔒</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
