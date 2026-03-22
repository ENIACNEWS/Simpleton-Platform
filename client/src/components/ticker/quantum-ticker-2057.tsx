import React, { useState, useEffect, useRef } from 'react';
import { Brain, TrendingUp, TrendingDown, Zap, Eye, Layers, Cpu } from 'lucide-react';

interface AICompanyData {
  id: string;
  name: string;
  symbol?: string;
  valuation: number;
  funding: number;
  employees: number;
  models: string[];
  category: 'foundation' | 'application' | 'hardware' | 'research' | 'startup';
  stage: 'public' | 'private' | 'ipo_ready' | 'acquired';
  performance: {
    revenue: number;
    growth: number;
    efficiency: number;
    innovation: number;
  };
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  dataSource?: string; // Real data source attribution
  predictions?: {
    next1h: { valuation: number; confidence: number; direction: string };
    next24h: { valuation: number; confidence: number; direction: string };
    next7d: { valuation: number; confidence: number; direction: string };
    next30d: { valuation: number; confidence: number; direction: string };
  };
  quantumMetrics?: {
    momentum: number;
    volatility: number;
    innovation_velocity: number;
    market_gravity: number;
  };
}

interface AIModelData {
  id: string;
  name: string;
  company: string;
  type: 'llm' | 'vision' | 'multimodal' | 'specialized';
  parameters: string;
  performance: {
    benchmark: number;
    speed: number;
    accuracy: number;
    cost_efficiency: number;
  };
  availability: 'public' | 'api' | 'private' | 'beta';
  pricing: {
    per_token?: number;
    tier: 'free' | 'paid' | 'enterprise';
  };
  momentum: number;
  adoption: number;
  confidence: number;
  dataSource?: string; // Real data source attribution
  predictions?: any;
  realtime_metrics?: any;
}

interface QuantumTicker2057Props {
  position?: 'top' | 'bottom' | 'fullscreen';
  className?: string;
  customSize?: { width: number; height: number };
}

export function QuantumTicker2057({ position = 'fullscreen', className = '', customSize }: QuantumTicker2057Props) {
  const [aiCompanies, setAICompanies] = useState<AICompanyData[]>([]);
  const [aiModels, setAIModels] = useState<AIModelData[]>([]);
  const [selectedItem, setSelectedItem] = useState<AICompanyData | AIModelData | null>(null);
  const [viewMode, setViewMode] = useState<'stream' | '3d' | 'neural' | 'hologram'>('hologram');
  const [predictionDepth, setPredictionDepth] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [isQuantumMode, setIsQuantumMode] = useState(true);
  const [activeTab, setActiveTab] = useState<'companies' | 'models'>('companies');
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch AI intelligence data
  useEffect(() => {
    const fetchQuantumAIData = async () => {
      try {
        const [companiesRes, modelsRes] = await Promise.all([
          fetch('/api/quantum-ticker-2057/companies'),
          fetch('/api/quantum-ticker-2057/models')
        ]);

        if (companiesRes.ok) {
          const companiesData = await companiesRes.json();
          if (companiesData.success) {
            setAICompanies(companiesData.data);
          }
        }

        if (modelsRes.ok) {
          const modelsData = await modelsRes.json();
          if (modelsData.success) {
            setAIModels(modelsData.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch Quantum AI data:', error);
      }
    };

    fetchQuantumAIData();
    const interval = setInterval(fetchQuantumAIData, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  const getViewModeClasses = () => {
    switch (viewMode) {
      case 'hologram':
        return 'backdrop-blur-lg bg-gradient-to-br from-purple-500/20 via-cyan-500/10 to-blue-500/20 border border-cyan-500/30';
      case '3d':
        return 'backdrop-blur-md bg-gradient-to-br from-gray-900/80 to-black/90 border border-gray-500/50 transform perspective-1000';
      case 'neural':
        return 'backdrop-blur-sm bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-teal-500/20 border border-green-500/40';
      case 'stream':
        return 'backdrop-blur-none bg-gradient-to-r from-blue-900/90 to-purple-900/90 border border-blue-500/50';
      default:
        return 'backdrop-blur-lg bg-gradient-to-br from-purple-500/20 via-cyan-500/10 to-blue-500/20 border border-cyan-500/30';
    }
  };

  const renderCompanyCard = (company: AICompanyData, index: number) => {
    const isUp = company.trend === 'up';
    const isDown = company.trend === 'down';
    
    return (
      <div
        key={company.id}
        className={`${getViewModeClasses()} rounded-xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:brightness-110 ${
          selectedItem?.id === company.id ? 'ring-2 ring-cyan-400' : ''
        }`}
        onClick={() => setSelectedItem(company)}
        style={{
          animationDelay: `${index * 100}ms`,
        }}
      >
        {/* Company Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${
              company.category === 'foundation' ? 'from-purple-500 to-blue-500' :
              company.category === 'application' ? 'from-cyan-500 to-green-500' :
              'from-orange-500 to-red-500'
            } flex items-center justify-center`}>
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">{company.name}</h3>
              <p className="text-gray-300 text-sm capitalize">{company.category} • {company.stage}</p>
              {company.dataSource && (
                <p className="text-xs text-cyan-300/50 truncate">{company.dataSource}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            {isUp && <TrendingUp className="w-5 h-5 text-green-400 mb-1" />}
            {isDown && <TrendingDown className="w-5 h-5 text-red-400 mb-1" />}
            <div className="text-white font-bold text-lg">{formatNumber(company.valuation)}</div>
          </div>
        </div>

        {/* Quantum Metrics */}
        {isQuantumMode && company.quantumMetrics && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-cyan-400 text-xs uppercase tracking-wide">Momentum</div>
              <div className="text-white font-bold">{(company.quantumMetrics.momentum * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-purple-400 text-xs uppercase tracking-wide">Innovation</div>
              <div className="text-white font-bold">{company.quantumMetrics.innovation_velocity.toFixed(1)}</div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Revenue</span>
            <span className="text-green-400 font-medium">{formatNumber(company.performance.revenue)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Growth</span>
            <span className="text-blue-400 font-medium">{company.performance.growth}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Confidence</span>
            <span className="text-purple-400 font-medium">{company.confidence.toFixed(1)}%</span>
          </div>
        </div>

        {/* Models Preview */}
        <div className="mt-4 pt-4 border-t border-gray-600/30">
          <div className="text-gray-300 text-xs uppercase tracking-wide mb-2">Key Models</div>
          <div className="flex flex-wrap gap-1">
            {company.models.slice(0, 3).map((model, idx) => (
              <span
                key={idx}
                className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white text-xs px-2 py-1 rounded-full"
              >
                {model}
              </span>
            ))}
            {company.models.length > 3 && (
              <span className="text-gray-400 text-xs px-2 py-1">
                +{company.models.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderModelCard = (model: AIModelData, index: number) => {
    return (
      <div
        key={model.id}
        className={`${getViewModeClasses()} rounded-xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:brightness-110 ${
          selectedItem?.id === model.id ? 'ring-2 ring-cyan-400' : ''
        }`}
        onClick={() => setSelectedItem(model)}
        style={{
          animationDelay: `${index * 100}ms`,
        }}
      >
        {/* Model Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${
              model.type === 'llm' ? 'from-blue-500 to-cyan-500' :
              model.type === 'multimodal' ? 'from-purple-500 to-pink-500' :
              model.type === 'specialized' ? 'from-orange-500 to-red-500' :
              'from-green-500 to-teal-500'
            } flex items-center justify-center`}>
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">{model.name}</h3>
              <p className="text-gray-300 text-sm">{model.company} • {model.parameters}</p>
              {model.dataSource && (
                <p className="text-xs text-cyan-300/50 truncate">{model.dataSource}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-white font-bold text-lg">{model.performance.benchmark.toFixed(1)}</div>
            <div className="text-gray-400 text-xs">MMLU Score</div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-cyan-400 text-xs uppercase tracking-wide">Speed</div>
            <div className="text-white font-bold">{model.performance.speed}/100</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-purple-400 text-xs uppercase tracking-wide">Accuracy</div>
            <div className="text-white font-bold">{model.performance.accuracy}%</div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Momentum</span>
            <span className="text-green-400 font-medium">{model.momentum}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Adoption</span>
            <span className="text-blue-400 font-medium">{model.adoption}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Confidence</span>
            <span className="text-purple-400 font-medium">{model.confidence.toFixed(1)}%</span>
          </div>
        </div>

        {/* Pricing & Availability */}
        <div className="mt-4 pt-4 border-t border-gray-600/30">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Availability</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              model.availability === 'public' ? 'bg-green-500/20 text-green-400' :
              model.availability === 'api' ? 'bg-blue-500/20 text-blue-400' :
              'bg-orange-500/20 text-orange-400'
            }`}>
              {model.availability.toUpperCase()}
            </span>
          </div>
          {model.pricing.per_token && (
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-300 text-sm">Cost/Token</span>
              <span className="text-yellow-400 font-medium">${model.pricing.per_token.toFixed(4)}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`relative min-h-screen bg-black ${className}`}
      style={customSize ? { width: customSize.width, height: customSize.height } : {}}
    >
      {/* Quantum Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Control Panel */}
      <div className="relative z-10 p-6">
        <div className="flex flex-wrap items-center justify-between mb-8">
          {/* Mode Controls */}
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <div className="flex bg-black/50 rounded-xl p-1 border border-gray-600/30">
              {['hologram', '3d', 'neural', 'stream'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    viewMode === mode
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {mode === 'hologram' && <Eye className="w-4 h-4" />}
                  {mode === '3d' && <Layers className="w-4 h-4" />}
                  {mode === 'neural' && <Brain className="w-4 h-4" />}
                  {mode === 'stream' && <Zap className="w-4 h-4" />}
                </button>
              ))}
            </div>

            {/* Tab Selector */}
            <div className="flex bg-black/50 rounded-xl p-1 border border-gray-600/30">
              <button
                onClick={() => setActiveTab('companies')}
                className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'companies'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                AI Companies
              </button>
              <button
                onClick={() => setActiveTab('models')}
                className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'models'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                AI Models
              </button>
            </div>
          </div>

          {/* Quantum Toggle */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <span className="text-gray-300 text-sm">Quantum Mode</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isQuantumMode}
                  onChange={(e) => setIsQuantumMode(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                  isQuantumMode ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'bg-gray-600'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                    isQuantumMode ? 'translate-x-6 translate-y-0.5' : 'translate-x-0.5 translate-y-0.5'
                  }`} />
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeTab === 'companies' 
            ? aiCompanies.map(renderCompanyCard)
            : aiModels.map(renderModelCard)
          }
        </div>

        {/* No Data State */}
        {((activeTab === 'companies' && aiCompanies.length === 0) || 
          (activeTab === 'models' && aiModels.length === 0)) && (
          <div className="text-center py-16">
            <Brain className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Loading quantum AI intelligence...</p>
            <p className="text-gray-500 text-sm mt-2">Initializing neural networks and data streams</p>
          </div>
        )}
      </div>
    </div>
  );
}