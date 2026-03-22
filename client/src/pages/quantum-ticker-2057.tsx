import React from 'react';
import { Navigation } from '../components/layout/navigation';
import { Footer } from '../components/layout/footer';
import { QuantumTicker2057 } from '../components/ticker/quantum-ticker-2057';

export default function QuantumTicker2057Page() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      {/* Hero Section with Quantum Branding */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Quantum Badge */}
            <div className="inline-flex items-center px-6 py-3 mb-8 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-full border border-purple-500/30 backdrop-blur-sm">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full mr-3 animate-pulse" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 font-medium">
                QUANTUM TICKER 2057
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              <span className="text-blue-500">Simpleton</span>
              <span className="text-white"> Quantum Ticker</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400">
                2057™
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-2xl lg:text-3xl text-gray-300 mb-8 font-light">
              Simplicity Market Intelligence & Model Performance
            </p>

            {/* Features Grid */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm">
                <div className="text-2xl font-bold text-purple-400 mb-2">32+</div>
                <div className="text-white text-sm">AI APIs</div>
              </div>
              <div className="bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl p-6 backdrop-blur-sm">
                <div className="text-2xl font-bold text-cyan-400 mb-2">Real-Time</div>
                <div className="text-white text-sm">Model Performance</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-xl p-6 backdrop-blur-sm">
                <div className="text-2xl font-bold text-blue-400 mb-2">AI Companies</div>
                <div className="text-white text-sm">Valuations & Funding</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm">
                <div className="text-2xl font-bold text-purple-400 mb-2">Quantum</div>
                <div className="text-white text-sm">Predictions</div>
              </div>
            </div>

            {/* Description */}
            <div className="max-w-3xl mx-auto mt-16 text-lg text-white/80 leading-relaxed">
              The <span className="text-blue-500">Simpleton</span> Quantum Ticker 2057™ provides AI market intelligence tracking. 
              Built with data-driven algorithms, this ticker delivers real-time AI company valuations, 
              model performance benchmarks, and market analysis.
            </div>
          </div>
        </div>
      </section>

      {/* Full-Screen Quantum Ticker */}
      <div className="relative">
        <QuantumTicker2057 />
      </div>

      <Footer />
    </div>
  );
}