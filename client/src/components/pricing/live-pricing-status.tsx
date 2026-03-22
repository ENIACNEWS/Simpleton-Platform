import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Loader2, Key } from "lucide-react";
import { useLivePricing } from "@/hooks/use-live-pricing";

export function LivePricingStatus() {
  const { prices, isLoading, error, needsApiKeys } = useLivePricing();

  if (isLoading) {
    return (
      <Alert style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}>
        <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#60a5fa' }} />
        <AlertDescription style={{ color: '#93bbfd' }}>
          Connecting to live precious metals pricing...
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <Key className="h-4 w-4" style={{ color: '#f59e0b' }} />
        <AlertDescription style={{ color: '#fbbf24' }}>
          <div className="space-y-3">
            <div className="font-medium">
              Why Live Data Isn't Showing
            </div>
            <div className="text-sm" style={{ color: '#fcd34d' }}>
              All precious metals APIs require authentication - there are no "free without key" options available. 
              However, free tiers are very generous and easy to set up:
            </div>
            <div className="space-y-2 text-sm p-3 rounded" style={{ background: 'rgba(245,158,11,0.08)', color: '#fde68a' }}>
              <div>• <strong>Metals-API</strong> - 100 requests/month free • metals-api.com/register</div>
              <div>• <strong>MetalpriceAPI</strong> - Free tier available • metalpriceapi.com/pricing</div>
              <div>• <strong>GoldAPI.io</strong> - 1,000 requests/month free • goldapi.io</div>
            </div>
            <div className="text-xs" style={{ color: 'rgba(253,224,71,0.7)' }}>
              Setup takes 2 minutes, no credit card required. Once configured, live data appears automatically across the entire platform.
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              style={{ borderColor: 'rgba(245,158,11,0.3)', color: '#fbbf24' }}
              onClick={() => window.open('https://metals-api.com/register', '_blank')}
            >
              Get Free Keys (Recommended)
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (prices && prices.gold > 0) {
    return (
      <Alert style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
        <CheckCircle className="h-4 w-4" style={{ color: '#22c55e' }} />
        <AlertDescription style={{ color: '#86efac' }}>
          <div className="flex items-center justify-between">
            <span className="font-medium">Live Pricing Active</span>
            <div className="text-sm" style={{ color: '#bbf7d0' }}>
              Gold: ${prices.gold.toFixed(2)}/oz | Silver: ${prices.silver.toFixed(2)}/oz
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
      <AlertTriangle className="h-4 w-4" style={{ color: '#ef4444' }} />
      <AlertDescription style={{ color: '#fca5a5' }}>
        <div className="space-y-2">
          <div className="font-medium">Live Pricing Unavailable</div>
          <div className="text-sm" style={{ color: '#fecaca' }}>
            All precious metals APIs are currently not responding. Please check your API keys or try again later.
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
