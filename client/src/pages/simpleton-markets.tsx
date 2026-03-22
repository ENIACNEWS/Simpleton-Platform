import { useState } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { AIAssistant } from "@/components/ai-assistant";
import { MarketIntelligenceContent } from "@/pages/market-signals";
import { MarketAnalysisContent } from "@/pages/ai-market-analysis";
import { TickersContent } from "@/pages/tickers";
import { AIDirectoryContent } from "@/pages/universal-ai-directory";
import {
  Eye,
  Brain,
  BarChart3,
  BookOpen,
} from "lucide-react";

type MarketTab = 'intelligence' | 'analysis' | 'tickers' | 'directory';

const TABS: { key: MarketTab; label: string; icon: typeof Eye; description: string }[] = [
  {
    key: 'intelligence',
    label: 'Intelligence',
    icon: Eye,
    description: 'Proprietary buy/sell signals',
  },
  {
    key: 'analysis',
    label: 'Analysis',
    icon: Brain,
    description: 'Simplicity-powered deep dives',
  },
  {
    key: 'tickers',
    label: 'Tickers',
    icon: BarChart3,
    description: 'Live market data',
  },
  {
    key: 'directory',
    label: 'AI Directory',
    icon: BookOpen,
    description: 'AI company profiles',
  },
];

export default function SimpletonMarkets() {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MarketTab>('intelligence');

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <Navigation onAIToggle={() => setIsAIOpen(true)} />
      <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />

      <main className="flex-1 pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">
              <span style={{ color: 'var(--primary)' }}>Simpleton</span> Markets
            </h1>
            <p className="text-sm opacity-50 italic">
              "Pay attention to the signs, not the headlines."
            </p>
          </div>

          <div className="relative mb-8">
            <div className="flex justify-center">
              <div
                className="inline-flex rounded-xl p-1 gap-1"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className="relative flex items-center gap-2.5 px-5 sm:px-7 py-3 rounded-lg text-sm font-medium transition-all duration-300"
                      style={isActive ? {
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        boxShadow: '0 4px 20px rgba(0, 173, 238, 0.25)',
                      } : {
                        color: 'var(--muted-foreground)',
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      <div className="flex flex-col items-start">
                        <span className="leading-tight">{tab.label}</span>
                        <span
                          className="text-[10px] font-normal leading-tight hidden sm:block"
                          style={{ opacity: isActive ? 0.8 : 0.5 }}
                        >
                          {tab.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className="absolute bottom-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}
            />
          </div>

          <div className="min-h-[60vh]">
            {activeTab === 'intelligence' && <MarketIntelligenceContent />}
            {activeTab === 'analysis' && <MarketAnalysisContent />}
            {activeTab === 'tickers' && <TickersContent />}
            {activeTab === 'directory' && <AIDirectoryContent />}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
