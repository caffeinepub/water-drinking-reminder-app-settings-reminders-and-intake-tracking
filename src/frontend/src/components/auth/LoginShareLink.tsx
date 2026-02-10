import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard, isWebShareSupported } from '@/utils/clipboard';

export default function LoginShareLink() {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleCopy = async () => {
    const url = window.location.href;
    
    const result = await copyToClipboard(url);
    
    if (result.success) {
      setCopied(true);
      toast.success('Login link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error(result.error || 'Failed to copy link. Please copy the URL manually.');
    }
  };

  const handleShare = async () => {
    if (!isWebShareSupported()) {
      // No Web Share API, just copy
      await handleCopy();
      return;
    }

    setIsSharing(true);
    const url = window.location.href;

    try {
      await navigator.share({
        title: 'Stay Hydrated, Stay Vibing',
        text: 'Track your water, sleep, and runs. Earn badges and build streaks!',
        url: url,
      });
      toast.success('Shared successfully!');
    } catch (error: any) {
      // User cancelled or share failed
      if (error.name === 'AbortError') {
        // User cancelled, no error needed
        console.log('Share cancelled by user');
      } else {
        console.error('Share failed:', error);
        toast.error('Share failed. Try copying the link instead.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  const hasShareAPI = isWebShareSupported();

  return (
    <div className="flex flex-col items-center gap-3 mt-6">
      <p className="text-sm text-muted-foreground">Share this app with others</p>
      <div className="flex gap-2">
        {hasShareAPI && (
          <Button
            onClick={handleShare}
            variant="outline"
            size="lg"
            disabled={isSharing}
            className="gap-2 border-2 hover:border-primary/50 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        )}
        <Button
          onClick={handleCopy}
          variant="outline"
          size="lg"
          disabled={isSharing}
          className="gap-2 border-2 hover:border-primary/50 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-success" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Link
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
