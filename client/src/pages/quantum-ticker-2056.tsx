import React from 'react';
import { Navigation } from '../components/layout/navigation';
import { Footer } from '../components/layout/footer';
import { QuantumTicker2056 } from '../components/ticker/quantum-ticker-2056';

export default function QuantumTicker2056Page() {

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      {/* Hero Section with Quantum Branding */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Quantum Badge */}
            <div className="inline-flex items-center px-6 py-3 mb-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-blue-500/30 backdrop-blur-sm">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mr-3 animate-pulse" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-medium">
                QUANTUM TICKER 2056
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              <span className="text-blue-500">Simpleton</span>
              <span className="text-white"> Quantum Ticker</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">
                2056™
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-2xl lg:text-3xl text-gray-300 mb-8 font-light">
              Business & Financial Market Intelligence
            </p>

            {/* Features Grid */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-xl p-6 backdrop-blur-sm">
                <div className="text-2xl font-bold text-blue-400 mb-2">50+</div>
                <div className="text-white text-sm">Financial APIs</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm">
                <div className="text-2xl font-bold text-purple-400 mb-2">Real-Time</div>
                <div className="text-white text-sm">Market Data</div>
              </div>
              <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-xl p-6 backdrop-blur-sm">
                <div className="text-2xl font-bold text-indigo-400 mb-2">Crypto</div>
                <div className="text-white text-sm">& Stocks</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-xl p-6 backdrop-blur-sm">
                <div className="text-2xl font-bold text-blue-400 mb-2">Quantum</div>
                <div className="text-white text-sm">Predictions</div>
              </div>
            </div>

            {/* Description */}
            <div className="max-w-3xl mx-auto mt-16 text-lg text-white/80 leading-relaxed">
              The <span className="text-blue-500">Simpleton</span> Quantum Ticker 2056™ provides advanced financial market intelligence. 
              Built with data-driven algorithms, this ticker delivers real-time stock prices, 
              cryptocurrency data, and business analytics.
            </div>
          </div>
        </div>
      </section>

      {/* Full-Screen Quantum Ticker */}
      <div className="relative">
        <QuantumTicker2056 />
      </div>

      <Footer />
    </div>
  );
}