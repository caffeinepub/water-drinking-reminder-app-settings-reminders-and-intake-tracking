// Reusable component showing stale data indicator when offline
// Displays friendly message with optional timestamp

import { WifiOff, Clock } from 'lucide-react';

interface OfflineStaleNoticeProps {
  cachedAt?: number;
  className?: string;
}

export default function OfflineStaleNotice({ cachedAt, className = '' }: OfflineStaleNoticeProps) {
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`flex items-center gap-2 p-3 bg-warning/10 border border-warning/30 rounded-xl ${className}`}>
      <WifiOff className="w-4 h-4 text-warning flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-warning">
          Showing saved data from your last connection
        </p>
        {cachedAt && (
          <p className="text-xs text-warning/80 flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" />
            Last updated {formatTimestamp(cachedAt)}
          </p>
        )}
      </div>
    </div>
  );
}
