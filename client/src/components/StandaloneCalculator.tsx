import React, { useState, useRef, useEffect } from 'react';
import { X, Move, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthenticSimpletonCalculator } from '@/components/calculator/authentic-simpleton-calculator';

interface StandaloneCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StandaloneCalculator({ isOpen, onClose }: StandaloneCalculatorProps) {
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent);
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(() => ({
    x: Math.max(20, (window.innerWidth - 420) / 2),
    y: Math.max(20, (window.innerHeight - 620) / 2)
  }));
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [autoScale, setAutoScale] = useState(true);
  const calculatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoScale) return;
    const computeOptimalScale = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const calcWidth = 420;
      const calcHeight = 620;
      const scaleX = (w * 0.85) / calcWidth;
      const scaleY = (h * 0.80) / calcHeight;
      const optimal = Math.min(scaleX, scaleY, 2.0);
      setScale(Math.round(Math.max(optimal, 0.5) * 10) / 10);
    };
    computeOptimalScale();
    window.addEventListener('resize', computeOptimalScale);
    return () => window.removeEventListener('resize', computeOptimalScale);
  }, [autoScale]);

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (calculatorRef.current) {
      const rect = calculatorRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const scaleUp = () => {
    setAutoScale(false);
    setScale(prev => Math.min(prev + 0.1, 2));
  };

  const scaleDown = () => {
    setAutoScale(false);
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  if (!isOpen) return null;

  // Block calculator access on mobile devices
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 max-w-sm w-full text-center border border-gray-600">
          <div className="text-red-400 text-6xl mb-4">📱</div>
          <h3 className="text-xl font-bold text-white mb-2">Desktop Only</h3>
          <p className="text-gray-300 mb-4">The Precious Metals Calculator is available on desktop and tablet devices only.</p>
          <Button 
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={calculatorRef}
      className="fixed z-[9999] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-2xl border border-gray-600 select-none flex flex-col"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        maxHeight: `${Math.min(window.innerHeight - 40, 90 * window.innerHeight / 100)}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      {/* Header with drag handle and controls */}
      <div 
        className="flex items-center justify-between p-2 px-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-t-xl cursor-grab active:cursor-grabbing relative flex-shrink-0"
        onMouseDown={handleMouseDown}
      >
        <span className="text-xs font-semibold text-white select-none">Simpleton™ Calculator</span>
        <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
          <button
            onClick={scaleDown}
            className="flex items-center justify-center w-5 h-5 bg-white/20 hover:bg-white/30 text-white rounded transition-colors"
            title="Scale Down"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-white text-[10px] font-mono min-w-[2rem] text-center select-none">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={scaleUp}
            className="flex items-center justify-center w-5 h-5 bg-white/20 hover:bg-white/30 text-white rounded transition-colors"
            title="Scale Up"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-5 h-5 bg-red-500/60 hover:bg-red-500 text-white rounded transition-colors ml-1"
            title="Close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Precious Metals Calculator Body - Scrollable */}
      <div className="p-4 overflow-y-auto flex-1" style={{ pointerEvents: 'auto' }}>
        <AuthenticSimpletonCalculator />
      </div>
    </div>
  );
}