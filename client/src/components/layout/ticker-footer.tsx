import { useState, useEffect } from "react";
import { useLivePricing } from "@/hooks/use-live-pricing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Settings, 
  Play, 
  Pause, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Palette,
  Zap
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TickerSettings {
  speed: "slow" | "medium" | "fast";
  theme: "gold" | "silver" | "platinum" | "rainbow";
  showChange: boolean;
  showTime: boolean;
  showVolume: boolean;
  isRunning: boolean;
}

export function TickerFooter() {
  const { prices, isLoading } = useLivePricing();
  const [settings, setSettings] = useState<TickerSettings>({
    speed: "medium",
    theme: "gold",
    showChange: true,
    showTime: true,
    showVolume: false,
    isRunning: true
  });

  // Real market changes (would come from live API in production)
  const [priceChanges] = useState({
    gold: { change: 0, percent: 0 },
    silver: { change: 0, percent: 0 },
    platinum: { change: 0, percent: 0 },
    palladium: { change: 0, percent: 0 }
  });

  const speedClasses = {
    slow: "animate-scroll-slow",
    medium: "animate-scroll-medium", 
    fast: "animate-scroll-fast"
  };

  const themeClasses = {
    gold: "from-yellow-600 via-yellow-400 to-yellow-600",
    silver: "from-gray-400 via-gray-200 to-gray-400",
    platinum: "from-gray-600 via-gray-300 to-gray-600",
    rainbow: "from-purple-400 via-pink-400 via-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400"
  };

  const currentTime = new Date().toLocaleTimeString();

  const togglePlayPause = () => {
    setSettings(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const updateSetting = (key: keyof TickerSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-lg border-t border-gold/20">
      {/* Settings Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gold/10">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-gold" />
            <span className="text-sm font-semibold text-gold">LIVE MARKET DATA</span>
          </div>
          {settings.showTime && (
            <div className="text-xs text-yellow-400 font-mono">
              {currentTime}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Play/Pause Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={togglePlayPause}
            className="h-8 w-8 p-0 text-gold hover:text-yellow-300"
          >
            {settings.isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          {/* Settings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gold hover:text-yellow-300">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Ticker Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel className="text-xs text-muted-foreground">Speed</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => updateSetting('speed', 'slow')}>
                <div className="flex items-center">
                  <div className={cn("w-2 h-2 rounded-full mr-2", settings.speed === 'slow' ? 'bg-gold' : 'bg-gray-400')} />
                  Slow
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateSetting('speed', 'medium')}>
                <div className="flex items-center">
                  <div className={cn("w-2 h-2 rounded-full mr-2", settings.speed === 'medium' ? 'bg-gold' : 'bg-gray-400')} />
                  Medium
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateSetting('speed', 'fast')}>
                <div className="flex items-center">
                  <div className={cn("w-2 h-2 rounded-full mr-2", settings.speed === 'fast' ? 'bg-gold' : 'bg-gray-400')} />
                  Fast
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">Theme</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => updateSetting('theme', 'gold')}>
                <Palette className="w-4 h-4 mr-2 text-yellow-500" />
                Gold
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateSetting('theme', 'silver')}>
                <Palette className="w-4 h-4 mr-2 text-yellow-400" />
                Silver
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateSetting('theme', 'platinum')}>
                <Palette className="w-4 h-4 mr-2 text-yellow-300" />
                Platinum
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateSetting('theme', 'rainbow')}>
                <Palette className="w-4 h-4 mr-2 text-purple-400" />
                Rainbow
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem 
                checked={settings.showChange} 
                onCheckedChange={(checked) => updateSetting('showChange', checked)}
              >
                Show Price Changes
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem 
                checked={settings.showTime} 
                onCheckedChange={(checked) => updateSetting('showTime', checked)}
              >
                Show Time
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem 
                checked={settings.showVolume} 
                onCheckedChange={(checked) => updateSetting('showVolume', checked)}
              >
                Show Volume (Demo)
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Ticker Content */}
      <div className="relative h-12 overflow-hidden">
        <div className={cn(
          "absolute whitespace-nowrap py-3 px-4 bg-gradient-to-r text-yellow-900 font-bold text-sm",
          themeClasses[settings.theme],
          settings.isRunning ? speedClasses[settings.speed] : ""
        )}>
          {!isLoading && prices ? (
            <div className="flex items-center space-x-12">
              {/* Gold */}
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>GOLD (AU)</span>
                <span className="sv-ticker">${prices.gold.toFixed(2)}</span>
                {settings.showChange && (
                  <div className="flex items-center space-x-1">
                    {priceChanges.gold.change > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={cn("text-xs", priceChanges.gold.change > 0 ? "text-green-600" : "text-red-600")}>
                      {priceChanges.gold.change > 0 ? '+' : ''}{priceChanges.gold.change} ({priceChanges.gold.percent > 0 ? '+' : ''}{priceChanges.gold.percent}%)
                    </span>
                  </div>
                )}
              </div>

              {/* Silver */}
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>SILVER (AG)</span>
                <span className="sv-ticker">${prices.silver.toFixed(2)}</span>
                {settings.showChange && (
                  <div className="flex items-center space-x-1">
                    {priceChanges.silver.change > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={cn("text-xs", priceChanges.silver.change > 0 ? "text-green-600" : "text-red-600")}>
                      {priceChanges.silver.change > 0 ? '+' : ''}{priceChanges.silver.change} ({priceChanges.silver.percent > 0 ? '+' : ''}{priceChanges.silver.percent}%)
                    </span>
                  </div>
                )}
              </div>

              {/* Platinum */}
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>PLATINUM (PT)</span>
                <span className="sv-ticker">${prices.platinum.toFixed(2)}</span>
                {settings.showChange && (
                  <div className="flex items-center space-x-1">
                    {priceChanges.platinum.change > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={cn("text-xs", priceChanges.platinum.change > 0 ? "text-green-600" : "text-red-600")}>
                      {priceChanges.platinum.change > 0 ? '+' : ''}{priceChanges.platinum.change} ({priceChanges.platinum.percent > 0 ? '+' : ''}{priceChanges.platinum.percent}%)
                    </span>
                  </div>
                )}
              </div>



              {settings.showVolume && (
                <>
                  <div className="flex items-center space-x-2">
                    <span>VOLUME: 2.4M oz</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>MARKET CAP: $12.8B</span>
                  </div>
                </>
              )}

              {/* Separator and repeat for continuous scroll */}
              <span className="mx-8 text-gold">•••</span>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <span>Loading market data...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}