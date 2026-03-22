import { useState } from "react";
import { StandaloneDiamondCalculator } from "@/components/StandaloneDiamondCalculator";
import { Diamond, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function StandaloneDiamondCalculatorPage() {
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
            <h1 className="text-2xl font-bold text-blue-400">Standalone Diamond Calculator</h1>
          </div>
          
          {!isCalculatorOpen && (
            <button
              onClick={() => setIsCalculatorOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Diamond className="w-4 h-4" />
              Open Calculator
            </button>
          )}
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-8 border border-blue-400/20">
            <div className="text-center mb-8">
              <div className="text-blue-400 text-6xl mb-4">💎</div>
              <h2 className="text-3xl font-bold mb-4">Diamond Calculator</h2>
              <p className="text-gray-300 text-lg">
                Professional diamond calculator with live market data. 
                Calculate diamond values with authentic Rapaport pricing and GIA standards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-400 mb-4">Features</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    Live diamond pricing from Rapaport
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    GIA certified clarity grades (FL to I3)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    Color grades (D to M colorless scale)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    All diamond shapes (Round, Princess, Emerald, etc.)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    Natural and lab-grown diamond pricing
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    Wholesale, retail, and loan valuations
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-400 mb-4">How to Use</h3>
                <ol className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-semibold">1.</span>
                    Click "Open Calculator" to launch the draggable diamond calculator
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-semibold">2.</span>
                    Enter carat weight (0.01 to 50.00 carats)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-semibold">3.</span>
                    Select clarity grade using GIA standards
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-semibold">4.</span>
                    Choose color grade (D-M scale)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-semibold">5.</span>
                    Pick diamond shape and type (natural/lab-grown)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-semibold">6.</span>
                    View professional valuations with market data
                  </li>
                </ol>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-400/10 rounded-lg border border-blue-400/20">
              <h4 className="text-lg font-semibold text-blue-400 mb-2">Professional Grade</h4>
              <p className="text-gray-300">
                This calculator uses authentic Rapaport pricing, GIA clarity standards, and professional 
                diamond grading criteria. Trusted by diamond dealers, gemologists, and jewelry professionals worldwide.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-400/5 p-4 rounded-lg border border-blue-400/20">
                <h5 className="text-blue-400 font-semibold mb-2">Clarity Grades</h5>
                <p className="text-gray-400 text-sm">FL, IF, VVS1, VVS2, VS1, VS2, SI1, SI2, I1, I2, I3</p>
              </div>
              <div className="bg-blue-400/5 p-4 rounded-lg border border-blue-400/20">
                <h5 className="text-blue-400 font-semibold mb-2">Color Grades</h5>
                <p className="text-gray-400 text-sm">D (colorless) through M (light yellow)</p>
              </div>
              <div className="bg-blue-400/5 p-4 rounded-lg border border-blue-400/20">
                <h5 className="text-blue-400 font-semibold mb-2">Diamond Shapes</h5>
                <p className="text-gray-400 text-sm">Round, Princess, Emerald, Oval, Pear, Marquise, Heart, Cushion, Asscher, Radiant</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Standalone Diamond Calculator */}
      <StandaloneDiamondCalculator 
        isOpen={isCalculatorOpen} 
        onClose={() => setIsCalculatorOpen(false)} 
      />
    </div>
  );
}