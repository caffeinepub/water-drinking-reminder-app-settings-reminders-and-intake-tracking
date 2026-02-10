import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useActor } from '../../hooks/useActor';
import { toast } from 'sonner';
import { Copy, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminDebugInfo() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const [copied, setCopied] = useState(false);
  const [whoamiResult, setWhoamiResult] = useState<string | null>(null);
  const [whoamiLoading, setWhoamiLoading] = useState(false);

  const principal = identity?.getPrincipal().toString() || 'Not logged in';

  const handleCopy = () => {
    navigator.clipboard.writeText(principal);
    setCopied(true);
    toast.success('Principal ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhoami = async () => {
    if (!actor) {
      toast.error('Actor not available');
      return;
    }

    setWhoamiLoading(true);
    try {
      const result = await actor.whoami();
      const resultStr = result.toString();
      setWhoamiResult(resultStr);
      
      if (resultStr === principal) {
        toast.success('Backend whoami matches your principal ✓');
      } else {
        toast.error('Backend whoami does NOT match your principal');
      }
    } catch (error: any) {
      toast.error(`Whoami failed: ${error.message}`);
      setWhoamiResult(null);
    } finally {
      setWhoamiLoading(false);
    }
  };

  return (
    <Card className="border-2 shadow-lg bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Debug Information</CardTitle>
        <CardDescription>Technical details for troubleshooting</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Your Principal ID</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 rounded bg-muted text-xs break-all font-mono">
              {principal}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <CheckCircle2 className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Backend Whoami Test</div>
          <Button
            variant="outline"
            onClick={handleWhoami}
            disabled={whoamiLoading || !actor}
            className="w-full"
          >
            {whoamiLoading ? 'Testing...' : 'Test Backend Connection'}
          </Button>
          {whoamiResult && (
            <div className="p-3 rounded-lg bg-muted space-y-2">
              <div className="flex items-start gap-2">
                {whoamiResult === principal ? (
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                )}
                <div className="flex-1 space-y-1">
                  <div className="text-sm font-medium">
                    {whoamiResult === principal ? 'Match ✓' : 'Mismatch ✗'}
                  </div>
                  <code className="text-xs break-all block font-mono">
                    {whoamiResult}
                  </code>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Troubleshooting</div>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Copy your Principal ID and share it with an admin to grant access</li>
            <li>The backend whoami test verifies your connection to the canister</li>
            <li>If tests fail, try logging out and back in</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
