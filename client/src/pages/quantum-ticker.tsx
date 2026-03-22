import { useState } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { AIAssistant } from "@/components/ai-assistant";
import QuantumTicker2055 from "@/components/ticker/quantum-ticker-2055";

export default function QuantumTickerPage() {
  const [isAIOpen, setIsAIOpen] = useState(false);

  return (
    <div className="min-h-screen bg-primary-950 text-white flex flex-col">
      <Navigation onAIToggle={() => setIsAIOpen(true)} />
      <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
      
      {/* Quantum Ticker 2055 Hero Section */}
      <section className="flex-1 pt-8 pb-8 relative overflow-hidden">
        {/* Futuristic Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDuration: '3s'}}></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-l from-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDuration: '5s', animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-500/5 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDuration: '7s', animationDelay: '3s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-8">
            {/* Header */}
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl xl:text-7xl font-heading font-bold leading-tight tracking-tight" style={{
                fontOpticalSizing: 'auto', 
                fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1', 
                textRendering: 'optimizeLegibility', 
                WebkitFontSmoothing: 'antialiased', 
                MozOsxFontSmoothing: 'grayscale'
              }}>
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent" style={{
                  filter: 'brightness(1.3) contrast(1.2)', 
                  fontOpticalSizing: 'auto',
                  fontVariant: 'tabular-nums',
                  textRendering: 'optimizeLegibility',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale'
                }}>
                  Quantum Ticker 2055™
                </span>
                <br />
                <span className="text-white font-medium text-2xl lg:text-3xl xl:text-4xl">The Future of Market Data</span>
              </h1>
              
              <div className="text-xl lg:text-2xl text-cyan-200 leading-relaxed max-w-4xl mx-auto" style={{
                filter: 'brightness(1.1)', 
                fontOpticalSizing: 'auto',
                textRendering: 'optimizeLegibility',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale'
              }}>
                Comprehensive market intelligence with advanced technology. Real-time precious metals, lottery data, diamond pricing, and data-driven analytics in one interface.
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-6">
                <div className="text-cyan-400 text-3xl mb-4">⚡</div>
                <h3 className="text-xl font-bold text-cyan-300 mb-2">Quantum Speed</h3>
                <p className="text-cyan-100">Lightning-fast data processing with quantum-enhanced algorithms</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
                <div className="text-purple-400 text-3xl mb-4">🔮</div>
                <h3 className="text-xl font-bold text-purple-300 mb-2">Predictive AI</h3>
                <p className="text-purple-100">Advanced machine learning for market trend prediction</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-6">
                <div className="text-blue-400 text-3xl mb-4">🌐</div>
                <h3 className="text-xl font-bold text-blue-300 mb-2">Multi-Source Data</h3>
                <p className="text-blue-100">Live feeds from precious metals, lottery, and diamond markets</p>
              </div>
            </div>

            {/* Description */}
            <div className="max-w-3xl mx-auto mt-16 text-lg text-white/80 leading-relaxed">
              The <span className="simpleton-brand">Simpleton</span> Quantum Ticker 2055™ provides advanced market data visualization. Built with data-driven algorithms, this ticker delivers real-time market intelligence across multiple asset classes.
            </div>
          </div>
        </div>
      </section>

      {/* Full-Screen Quantum Ticker */}
      <div className="relative">
        <QuantumTicker2055 />
      </div>

      <Footer />
    </div>
  );
}