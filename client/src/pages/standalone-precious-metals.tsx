import { useState } from "react";
import { StandaloneCalculator } from "@/components/StandaloneCalculator";
import { Calculator, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function StandalonePreciousMetals() {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(true);

  return (
    <div className="min-h-screen bg-primary-950 text-white">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <button className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </button>
            </Link>
            <h1 className="text-2xl font-bold text-gold">Standalone Precious Metals Calculator</h1>
          </div>
          
          {!isCalculatorOpen && (
            <button
              onClick={() => setIsCalculatorOpen(true)}
              className="flex items-center gap-2 bg-gold hover:bg-gold/80 text-black px-4 py-2 rounded-lg transition-colors"
            >
              <Calculator className="w-4 h-4" />
              Open Calculator
            </button>
          )}
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-8 border border-gold/20">
            <div className="text-center mb-8">
              <div className="text-gold text-6xl mb-4">🧮</div>
              <h2 className="text-3xl font-bold mb-4">Precious Metals Calculator</h2>
              <p className="text-gray-300 text-lg">
                Professional precious metals calculator with live market data. 
                Calculate gold, silver, platinum, and palladium values with real-time pricing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gold mb-4">Features</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-gold rounded-full"></span>
                    Live market pricing from Kitco
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-gold rounded-full"></span>
                    Multiple weight units (grams, troy ounces)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-gold rounded-full"></span>
                    Karat purity settings (24K, 22K, 18K, 14K, 10K)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-gold rounded-full"></span>
                    Silver purity (925, 900, 800)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-gold rounded-full"></span>
                    Platinum and palladium support
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gold mb-4">How to Use</h3>
                <ol className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-gold font-semibold">1.</span>
                    Click "Open Calculator" to launch the draggable calculator
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold font-semibold">2.</span>
                    Select your metal type (Gold, Silver, Platinum, Palladium)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold font-semibold">3.</span>
                    Choose purity/karat level using the quick buttons
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold font-semibold">4.</span>
                    Enter weight and select unit (grams or troy ounces)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold font-semibold">5.</span>
                    View instant calculations with live market prices
                  </li>
                </ol>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gold/10 rounded-lg border border-gold/20">
              <h4 className="text-lg font-semibold text-gold mb-2">Professional Grade</h4>
              <p className="text-gray-300">
                This calculator uses authentic live market data from Kitco and professional precious metals 
                trading standards. Trusted by jewelers, coin dealers, and precious metals investors worldwide.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Standalone Calculator */}
      <StandaloneCalculator 
        isOpen={isCalculatorOpen} 
        onClose={() => setIsCalculatorOpen(false)} 
      />
    </div>
  );
}