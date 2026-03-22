import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, Coins, Diamond, ArrowRight } from 'lucide-react';

interface MetalPrice {
  metal: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

interface DiamondData {
  averagePrice: number;
  marketTrend: string;
  lastUpdated: string;
}

interface TickerData {
  metals: MetalPrice[];
  diamonds?: DiamondData;
}

export function DataTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fetch real precious metals data
  const { data: metalsData } = useQuery<{success: boolean; data: MetalPrice[]}>({
    queryKey: ['/api/ticker/metals'],
    refetchInterval: 30000, // Update every 30 seconds
  });

  // Fetch diamond data if available
  const { data: diamondData } = useQuery<{success: boolean; data: any}>({
    queryKey: ['/api/diamonds/pricing'],
    refetchInterval: 60000, // Update every minute
  });

  // Prepare ticker items
  const tickerItems: any[] = [];
  
  // Add metals data
  if (metalsData?.data) {
    metalsData.data.forEach(metal => {
      tickerItems.push({
        type: 'metal',
        name: metal.metal,
        price: metal.price,
        change: metal.change,
        changePercent: metal.changePercent,
        icon: Coins,
        color: metal.metal.toLowerCase() === 'gold' ? 'text-yellow-400' : 
               metal.metal.toLowerCase() === 'silver' ? 'text-gray-300' :
               metal.metal.toLowerCase() === 'platinum' ? 'text-gray-400' : 'text-gray-500'
      });
    });
  }

  // Add diamond data if available - only authentic data
  if (diamondData?.data && Array.isArray(diamondData.data) && diamondData.data.length > 0) {
    // Calculate authentic average price from real diamond data
    const totalPrice = diamondData.data.reduce((sum: number, diamond: any) => {
      return sum + (diamond.price || 0);
    }, 0);
    const averagePrice = Math.round(totalPrice / diamondData.data.length);
    
    // Only add to ticker if we have authentic price data
    if (averagePrice > 0) {
      tickerItems.push({
        type: 'diamond',
        name: 'Diamonds',
        price: averagePrice,
        change: 0,
        changePercent: 0,
        icon: Diamond,
        color: 'text-purple-400'
      });
    }
  }

  // Auto-advance ticker
  useEffect(() => {
    if (tickerItems.length === 0) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % tickerItems.length);
        setIsTransitioning(false);
      }, 200);
    }, 3000);

    return () => clearInterval(interval);
  }, [tickerItems.length]);

  if (tickerItems.length === 0) {
    return (
      <div className="bg-black/60 backdrop-blur-sm border-b border-cyan-500/30 py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center">
          <div className="flex items-center gap-2 text-cyan-400">
            <Coins className="w-4 h-4 animate-pulse" />
            <span className="text-sm">Loading market data...</span>
          </div>
        </div>
      </div>
    );
  }

  const currentItem = tickerItems[currentIndex];
  const IconComponent = currentItem.icon;

  return (
    <div className="bg-black/60 backdrop-blur-sm border-b border-cyan-500/30 py-1">
      <div className="max-w-7xl mx-auto px-4">
        <div className={`flex items-center justify-center gap-4 transition-opacity duration-200 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
          <IconComponent className={`w-3 h-3 ${currentItem.color}`} />
          <span className="text-white font-semibold text-xs">
            {currentItem.name}
          </span>
          <span className="text-cyan-400 font-mono text-xs">
            ${currentItem.price.toLocaleString()}
          </span>
          {currentItem.change !== 0 && (
            <div className={`flex items-center gap-1 ${currentItem.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {currentItem.change > 0 ? 
                <TrendingUp className="w-2 h-2" /> : 
                <TrendingDown className="w-2 h-2" />
              }
              <span className="text-xs font-mono">
                {currentItem.change > 0 ? '+' : ''}{currentItem.changePercent.toFixed(2)}%
              </span>
            </div>
          )}
          <span className="text-xs text-gray-400">
            {currentItem.type === 'metal' ? 'METALS' : 'DIAMONDS'} • LIVE
          </span>
          <div className="flex gap-1">
            {tickerItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-1 h-1 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? "bg-cyan-400 w-3"
                    : "bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to ${tickerItems[index].name}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}