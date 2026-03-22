import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator, X, Minus, Plus, RotateCcw } from 'lucide-react';
import { AuthenticSimpletonCalculator } from '@/components/calculator/authentic-simpleton-calculator';

interface CalculatorOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalculatorOverlay({ isOpen, onClose }: CalculatorOverlayProps) {
  const [scale, setScale] = useState(0.6);
  
  const scaleUp = () => setScale(prev => Math.min(prev + 0.1, 1.2));
  const scaleDown = () => setScale(prev => Math.max(prev - 0.1, 0.3));
  const resetScale = () => setScale(0.6);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay Background */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Calculator Container */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <Card className="bg-white rounded-2xl shadow-2xl border-0 max-w-fit max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-amber-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 relative">
                <Calculator className="w-6 h-6 text-white relative z-10" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-gold to-yellow-600 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-gradient-to-br from-silver to-gray-400 rounded-full animate-bounce" style={{animationDuration: '2s'}}></div>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Precious Metals Calculator</h3>
                <p className="text-sm text-yellow-100 opacity-90">Precision Pricing, Simplified</p>
              </div>
            </div>
            <Button 
              onClick={onClose}
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-white/20 hover:scale-110 transition-all duration-200 h-9 w-9 p-0 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Scale Controls */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">Calculator Scale</div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={scaleDown}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-gray-300 hover:border-yellow-400 hover:bg-yellow-50"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <div className="text-sm font-medium text-gray-600 min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </div>
              <Button
                onClick={scaleUp}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-gray-300 hover:border-yellow-400 hover:bg-yellow-50"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                onClick={resetScale}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-gray-300 hover:border-yellow-400 hover:bg-yellow-50"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Calculator Content */}
          <CardContent className="p-6 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div 
              className="relative transition-transform duration-300 ease-in-out"
              style={{ transform: `scale(${scale})` }}
            >
              <AuthenticSimpletonCalculator />
              {/* Animated Elements */}
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-gold to-yellow-600 rounded-full flex items-center justify-center text-yellow-900 font-bold text-sm animate-bounce" style={{animationDuration: '3s'}}>
                Au
              </div>
              <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-gradient-to-br from-silver to-gray-400 rounded-full flex items-center justify-center text-yellow-900 font-bold text-sm animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}>
                Ag
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}