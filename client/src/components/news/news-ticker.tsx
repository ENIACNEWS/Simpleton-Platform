import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewsItem {
  id: number;
  title: string;
  source: string;
  icon: string;
  timeAgo: string;
  impact: 'positive' | 'negative' | 'neutral';
  url?: string;
}

interface NewsTickerProps {
  category: 'metals' | 'diamonds' | 'watches';
  isEnabled?: boolean;
  onToggle?: (enabled: boolean) => void;
}

export function NewsTicker({ category, isEnabled = true, onToggle }: NewsTickerProps) {
  const [showTicker, setShowTicker] = useState(isEnabled);
  const [isPaused, setIsPaused] = useState(false);
  const [expandedItem, setExpandedItem] = useState<NewsItem | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: newsData, isLoading } = useQuery({
    queryKey: [`/api/news/ticker?category=${category}`],
    refetchInterval: 5 * 60 * 1000,
    enabled: showTicker,
  });

  useEffect(() => {
    setShowTicker(isEnabled);
  }, [isEnabled]);

  const handleToggle = () => {
    const newState = !showTicker;
    setShowTicker(newState);
    if (onToggle) onToggle(newState);
  };

  const newsItems: NewsItem[] = (newsData?.data || []).filter((item: any) => item && item.title);

  const handleItemClick = (item: NewsItem) => {
    if (item.url && item.url !== '#') {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else {
      setExpandedItem(expandedItem?.id === item.id ? null : item);
    }
  };

  const impactColor = (impact: string) => {
    if (impact === 'positive') return 'text-emerald-400';
    if (impact === 'negative') return 'text-red-400';
    return 'text-cyan-300';
  };

  const impactDot = (impact: string) => {
    if (impact === 'positive') return 'bg-emerald-400';
    if (impact === 'negative') return 'bg-red-400';
    return 'bg-cyan-400';
  };

  return (
    <div className="w-full relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className="absolute top-1 right-1 z-20 h-6 w-6 p-0 hover:bg-gray-700 text-gray-400 hover:text-white bg-gray-800 border border-gray-600 rounded"
        title={showTicker ? "Hide news ticker" : "Show news ticker"}
      >
        {showTicker ? <EyeOff size={12} /> : <Eye size={12} />}
      </Button>

      <AnimatePresence>
        {showTicker && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full relative overflow-hidden"
            style={{
              background: 'linear-gradient(90deg, rgba(2,6,23,0.95) 0%, rgba(5,15,35,0.95) 50%, rgba(2,6,23,0.95) 100%)',
              borderTop: '1px solid rgba(201,169,110,0.15)',
              borderBottom: '1px solid rgba(201,169,110,0.1)',
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => { setIsPaused(false); setExpandedItem(null); }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/[0.04] to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
            </div>

            <div className="px-3 py-2 relative z-10">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="animate-pulse w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                    <div className="animate-pulse w-1.5 h-1.5 bg-amber-300 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                    <div className="animate-pulse w-1.5 h-1.5 bg-amber-200 rounded-full" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className="text-amber-300/70 font-medium text-[11px] tracking-wider uppercase">Loading market news...</span>
                </div>
              ) : newsItems.length === 0 ? (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs">No headlines available</span>
                </div>
              ) : (
                <div className="flex flex-col gap-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                      <span className="text-[10px] font-semibold tracking-[0.15em] uppercase" style={{ color: 'rgba(201,169,110,0.8)' }}>
                        {category === 'metals' ? 'Metals Intel' : category === 'diamonds' ? 'Diamond Intel' : 'Market Intel'}
                      </span>
                    </div>
                    {newsData?.isLive && (
                      <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: 'rgb(52,211,153)' }}>
                        Live
                      </span>
                    )}
                    <div className="flex-1" />
                    <span className="text-[10px] tracking-wide" style={{ color: 'rgba(148,163,184,0.4)' }}>
                      Click headline to read
                    </span>
                  </div>

                  <div
                    ref={scrollRef}
                    className="overflow-hidden relative"
                  >
                    <motion.div
                      className="flex gap-1"
                      animate={isPaused ? {} : { x: [0, -(newsItems.length * 280)] }}
                      transition={isPaused ? {} : {
                        duration: newsItems.length * 8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      {newsItems.concat(newsItems).concat(newsItems).map((item: NewsItem, index: number) => {
                        if (!item || !item.title) return null;
                        const hasLink = item.url && item.url !== '#';
                        return (
                          <button
                            key={`${item.id}-${index}`}
                            onClick={() => handleItemClick(item)}
                            className="group flex items-center gap-2 whitespace-nowrap min-w-max px-3 py-1.5 rounded-lg transition-all duration-200 text-left"
                            style={{
                              background: expandedItem?.id === item.id ? 'rgba(201,169,110,0.08)' : 'transparent',
                              border: expandedItem?.id === item.id ? '1px solid rgba(201,169,110,0.15)' : '1px solid transparent',
                            }}
                          >
                            <div className={`w-1 h-1 rounded-full flex-shrink-0 ${impactDot(item.impact)}`} />
                            <span className={`text-[11px] font-medium transition-colors duration-200 group-hover:text-amber-200 ${impactColor(item.impact)}`}>
                              {item.title.length > 55 ? item.title.substring(0, 55) + '...' : item.title}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-medium" style={{ background: 'rgba(148,163,184,0.08)', color: 'rgba(148,163,184,0.5)' }}>
                              {item.source}
                            </span>
                            <span className="text-[9px]" style={{ color: 'rgba(148,163,184,0.35)' }}>
                              {item.timeAgo || 'now'}
                            </span>
                            {hasLink && (
                              <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-70 transition-opacity flex-shrink-0" style={{ color: 'rgba(201,169,110,0.6)' }} />
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {expandedItem && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-3 pt-2 mt-1.5" style={{ borderTop: '1px solid rgba(201,169,110,0.08)' }}>
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${impactDot(expandedItem.impact)}`} />
                          <p className="text-xs font-medium flex-1" style={{ color: 'var(--foreground)', opacity: 0.9 }}>
                            {expandedItem.title}
                          </p>
                          <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(148,163,184,0.06)', color: 'rgba(148,163,184,0.5)' }}>
                            {expandedItem.source} · {expandedItem.timeAgo}
                          </span>
                          {expandedItem.url && expandedItem.url !== '#' && (
                            <a
                              href={expandedItem.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded transition-colors"
                              style={{ background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)', color: 'rgb(201,169,110)' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              Read <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <div className="absolute top-0 left-0 w-12 h-full pointer-events-none" style={{ background: 'linear-gradient(90deg, rgba(2,6,23,1) 0%, transparent 100%)' }} />
            <div className="absolute top-0 right-0 w-12 h-full pointer-events-none" style={{ background: 'linear-gradient(270deg, rgba(2,6,23,1) 0%, transparent 100%)' }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function useNewsTickerToggle(category: string, defaultEnabled: boolean = true) {
  const [isEnabled, setIsEnabled] = useState(() => {
    const saved = localStorage.getItem(`news-ticker-${category}`);
    return saved !== null ? JSON.parse(saved) : defaultEnabled;
  });

  const toggle = (enabled: boolean) => {
    setIsEnabled(enabled);
    localStorage.setItem(`news-ticker-${category}`, JSON.stringify(enabled));
  };

  return { isEnabled, toggle };
}
