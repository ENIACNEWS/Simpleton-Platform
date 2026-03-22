import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export function FooterTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Fetch metals pricing
  const { data: metalsData } = useQuery({
    queryKey: ["/api/ticker/metals"],
    refetchInterval: 30000,
  });

  // Fetch lottery data
  const { data: lotteryData } = useQuery({
    queryKey: ["/api/ticker/lottery"],
    refetchInterval: 60000,
  });

  // Combine all ticker items
  const tickerItems: TickerItem[] = [
    ...((metalsData as any)?.data || []).map((metal: any) => ({
      symbol: metal.metal.toUpperCase(),
      name: metal.metal,
      price: metal.price,
      change: metal.change,
      changePercent: metal.changePercent,
    })),
    // Add lottery jackpots
    ...((lotteryData as any)?.data || []).map((lottery: any) => ({
      symbol: lottery.game.split(' ')[0].toUpperCase(),
      name: `${lottery.game} Jackpot`,
      price: lottery.jackpot,
      change: 0,
      changePercent: 0,
    })),
  ];

  // Auto-scroll through items
  useEffect(() => {
    if (tickerItems.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tickerItems.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [tickerItems.length]);

  if (tickerItems.length === 0) {
    return null;
  }

  const currentItem = tickerItems[currentIndex];
  
  if (!currentItem) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 border-y border-gold/20 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 overflow-hidden">
            <motion.div
              key={currentIndex}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-3"
            >
              <span className="text-gold font-bold text-sm">{currentItem.symbol}</span>
              <span className="text-white/80 text-sm">{currentItem.name}</span>
              <span className="text-white font-mono text-sm">
                ${currentItem.price.toLocaleString()}
              </span>
              {currentItem.change !== 0 && (
                <div className="flex items-center space-x-1">
                  {currentItem.change > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : currentItem.change < 0 ? (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  ) : (
                    <Minus className="w-4 h-4 text-yellow-400" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      currentItem.change > 0
                        ? "text-green-400"
                        : currentItem.change < 0
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {(currentItem.changePercent || 0).toFixed(2)}%
                  </span>
                </div>
              )}
            </motion.div>
          </div>

          {/* Quick navigation dots */}
          <div className="flex space-x-1">
            {tickerItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-gold w-3"
                    : "bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to item ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}