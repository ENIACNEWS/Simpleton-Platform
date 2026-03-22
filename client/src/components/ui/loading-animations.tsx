import { Loader2, Sparkles, TrendingUp, Coins, Brain, Zap, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

// Base Loading Spinner with customization options
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "gold" | "silver" | "purple";
  className?: string;
}

export function LoadingSpinner({ size = "md", color = "primary", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  const colorClasses = {
    primary: "text-blue-500",
    secondary: "text-gray-500",
    gold: "text-yellow-500",
    silver: "text-gray-400",
    purple: "text-purple-500"
  };

  return (
    <Loader2 className={cn(
      "animate-spin",
      sizeClasses[size],
      colorClasses[color],
      className
    )} />
  );
}

// Floating Sparkles Animation
export function FloatingSparkles({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse absolute -top-2 -right-2" />
      <Sparkles className="w-4 h-4 text-yellow-300 animate-bounce absolute -bottom-1 -left-1 animation-delay-200" />
      <Sparkles className="w-3 h-3 text-yellow-500 animate-ping absolute top-1 left-1 animation-delay-500" />
    </div>
  );
}

// Pulsing Dots Loader
export function PulsingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex space-x-2", className)}>
      <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full animate-pulse"></div>
      <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full animate-pulse animation-delay-200"></div>
      <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full animate-pulse animation-delay-500"></div>
    </div>
  );
}

// Bouncing Coins Animation
export function BouncingCoins({ className }: { className?: string }) {
  return (
    <div className={cn("flex space-x-2 items-end", className)}>
      <Coins className="w-6 h-6 text-yellow-500 animate-bounce" />
      <Coins className="w-5 h-5 text-yellow-400 animate-bounce animation-delay-200" />
      <Coins className="w-4 h-4 text-yellow-600 animate-bounce animation-delay-500" />
    </div>
  );
}

// Brain Processing Animation (for AI)
export function BrainProcessing({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <Brain className="w-8 h-8 text-purple-500 animate-pulse" />
      <div className="absolute inset-0 bg-purple-400/20 rounded-full animate-ping"></div>
      <Zap className="w-4 h-4 text-blue-400 absolute -top-1 -right-1 animate-bounce" />
    </div>
  );
}

// Market Data Wave Animation
export function MarketWave({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <TrendingUp className="w-5 h-5 text-green-500 animate-pulse" />
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-1 bg-gradient-to-t from-green-400 to-green-600 rounded-full animate-bounce"
            style={{
              height: `${Math.random() * 20 + 10}px`,
              animationDelay: `${i * 100}ms`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Skeleton Card with shimmer effect
export function ShimmerCard({ className }: { className?: string }) {
  return (
    <div className={cn(
      "relative overflow-hidden bg-gray-200 dark:bg-gray-700 rounded-lg",
      "before:absolute before:inset-0 before:-translate-x-full",
      "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
      "before:animate-shimmer",
      className
    )}>
      <div className="space-y-4 p-6">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
      </div>
    </div>
  );
}

// Progress Wave Animation
export function ProgressWave({ progress = 0, className }: { progress?: number, className?: string }) {
  return (
    <div className={cn("relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden", className)}>
      <div 
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
      </div>
    </div>
  );
}

// Typing Indicator Animation
export function TypingIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("flex space-x-1 items-center", className)}>
      <span className="text-sm text-gray-500 dark:text-gray-400">Processing</span>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-200"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-500"></div>
      </div>
    </div>
  );
}

// Quantum Loading Animation (for tickers)
export function QuantumLoader({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-16 h-16", className)}>
      <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
      <div className="absolute inset-2 border-4 border-transparent border-t-purple-500 rounded-full animate-spin animation-reverse"></div>
      <div className="absolute inset-4 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin animation-delay-300"></div>
      <Zap className="absolute inset-0 m-auto w-4 h-4 text-yellow-400 animate-pulse" />
    </div>
  );
}

// Metal Price Loading Animation
export function MetalPriceLoader({ metal = "gold", className }: { metal?: string, className?: string }) {
  const metalColors = {
    gold: "from-yellow-400 to-yellow-600",
    silver: "from-gray-300 to-gray-500", 
    platinum: "from-gray-400 to-gray-600",
    palladium: "from-gray-500 to-gray-700"
  };

  return (
    <div className={cn("flex flex-col items-center space-y-2", className)}>
      <div className={cn(
        "w-12 h-12 rounded-full bg-gradient-to-br animate-pulse",
        metalColors[metal as keyof typeof metalColors] || metalColors.gold
      )}>
        <Coins className="w-6 h-6 text-white m-3 animate-bounce" />
      </div>
      <ProgressWave progress={75} className="w-16" />
      <TypingIndicator />
    </div>
  );
}

// Loading Screen Overlay
interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  type?: "default" | "ai" | "market" | "quantum";
  className?: string;
}

export function LoadingOverlay({ isVisible, message = "Loading...", type = "default", className }: LoadingOverlayProps) {
  if (!isVisible) return null;

  const renderLoader = () => {
    switch (type) {
      case "ai":
        return <BrainProcessing className="mb-4" />;
      case "market":
        return <MarketWave className="mb-4" />;
      case "quantum":
        return <QuantumLoader className="mb-4" />;
      default:
        return <LoadingSpinner size="xl" color="gold" className="mb-4" />;
    }
  };

  return (
    <div className={cn(
      "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center",
      "animate-in fade-in duration-300",
      className
    )}>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700 max-w-sm w-full mx-4">
        <div className="flex flex-col items-center text-center">
          {renderLoader()}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {message}
          </h3>
          <FloatingSparkles />
        </div>
      </div>
    </div>
  );
}