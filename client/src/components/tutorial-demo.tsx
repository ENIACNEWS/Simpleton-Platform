import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLivePricing } from "@/hooks/use-live-pricing";

interface TutorialDemoProps {
  tutorialType: "basic" | "scrap" | "custom-rates" | "fractional";
  className?: string;
}

export function TutorialDemo({ tutorialType, className }: TutorialDemoProps) {
  const [display, setDisplay] = useState("0");
  const [selectedMetal, setSelectedMetal] = useState("Gold");
  const [selectedPurity, setSelectedPurity] = useState("14K");
  const [unit, setUnit] = useState("grams");
  const [scrapBatch, setScrapBatch] = useState<Array<{id: string, weight: number, purity: string, value: number}>>([]);
  const { prices } = useLivePricing();

  const isDemo = true; // Tutorial demo mode

  const handleNumberClick = (num: string) => {
    if (display === "0") {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setScrapBatch([]);
  };

  const getCurrentPrice = () => {
    const metalPrices = {
      Gold: prices?.gold || 2650,
      Silver: prices?.silver || 31,
      Platinum: prices?.platinum || 960
    };
    
    const purityMultipliers: { [key: string]: number } = {
      "24K": 0.999, "22K": 0.917, "18K": 0.750, "14K": 0.583, "10K": 0.417,
      ".925": 0.925, ".950": 0.950
    };

    return metalPrices[selectedMetal as keyof typeof metalPrices] * (purityMultipliers[selectedPurity] || 1);
  };

  const calculateValue = () => {
    const weight = parseFloat(display) || 0;
    const pricePerOz = getCurrentPrice();
    const gramToOz = 31.1035;
    
    if (unit === "grams") {
      return (weight * pricePerOz / gramToOz).toFixed(2);
    } else {
      return (weight * pricePerOz).toFixed(2);
    }
  };

  const addToScrapBatch = () => {
    const weight = parseFloat(display) || 0;
    if (weight > 0) {
      const value = parseFloat(calculateValue());
      const newItem = {
        id: Date.now().toString(),
        weight,
        purity: selectedPurity,
        value
      };
      setScrapBatch([...scrapBatch, newItem]);
      setDisplay("0");
    }
  };

  const removeFromScrapBatch = (id: string) => {
    setScrapBatch(scrapBatch.filter(item => item.id !== id));
  };

  const getTotalScrapValue = () => {
    return scrapBatch.reduce((total, item) => total + item.value, 0).toFixed(2);
  };

  const getTotalScrapWeight = () => {
    return scrapBatch.reduce((total, item) => total + item.weight, 0).toFixed(2);
  };

  // Tutorial-specific UI based on type
  const renderBasicCalculator = () => (
    <div className="space-y-6">
      {/* Display */}
      <div className="bg-black/80 rounded-lg p-6 text-center">
        <div className="text-3xl font-mono text-yellow-400 mb-2">
          {display}g
        </div>
        <div className="text-lg text-green-400">
          ${calculateValue()} ({selectedMetal} {selectedPurity})
        </div>
        <div className="text-sm text-gray-400 mt-2">
          ${getCurrentPrice().toFixed(2)}/oz • Live Market
        </div>
      </div>

      {/* Metal Selection */}
      <div className="grid grid-cols-3 gap-2">
        {["Gold", "Silver", "Platinum"].map((metal) => (
          <Button
            key={metal}
            onClick={() => setSelectedMetal(metal)}
            className={cn(
              "h-12",
              selectedMetal === metal
                ? "bg-yellow-500 text-black"
                : "bg-gray-700 text-white hover:bg-gray-600"
            )}
          >
            {metal}
          </Button>
        ))}
      </div>

      {/* Purity Selection */}
      <div className="grid grid-cols-3 gap-2">
        {["24K", "18K", "14K", "10K", ".925", ".950"].map((purity) => (
          <Button
            key={purity}
            onClick={() => setSelectedPurity(purity)}
            className={cn(
              "h-10",
              selectedPurity === purity
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-white hover:bg-gray-600"
            )}
          >
            {purity}
          </Button>
        ))}
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            onClick={() => handleNumberClick(num.toString())}
            className="h-12 bg-gray-600 hover:bg-gray-500"
          >
            {num}
          </Button>
        ))}
        <Button
          onClick={() => handleNumberClick(".")}
          className="h-12 bg-gray-600 hover:bg-gray-500"
        >
          .
        </Button>
        <Button
          onClick={() => handleNumberClick("0")}
          className="h-12 bg-gray-600 hover:bg-gray-500"
        >
          0
        </Button>
        <Button
          onClick={handleClear}
          className="h-12 bg-red-600 hover:bg-red-500"
        >
          C
        </Button>
      </div>
    </div>
  );

  const renderScrapCalculator = () => (
    <div className="space-y-6">
      {/* Display */}
      <div className="bg-black/80 rounded-lg p-6 text-center">
        <div className="text-2xl font-mono text-yellow-400 mb-2">
          Add: {display}g of {selectedPurity}
        </div>
        <div className="text-lg text-green-400">
          Estimated Value: ${calculateValue()}
        </div>
      </div>

      {/* Metal & Purity Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-300 mb-2 block">Metal Type</label>
          <select
            value={selectedMetal}
            onChange={(e) => setSelectedMetal(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded"
          >
            <option value="Gold">Gold</option>
            <option value="Silver">Silver</option>
            <option value="Platinum">Platinum</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-300 mb-2 block">Purity</label>
          <select
            value={selectedPurity}
            onChange={(e) => setSelectedPurity(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded"
          >
            <option value="24K">24K</option>
            <option value="22K">22K</option>
            <option value="18K">18K</option>
            <option value="14K">14K</option>
            <option value="10K">10K</option>
            <option value=".925">.925 Silver</option>
          </select>
        </div>
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            onClick={() => handleNumberClick(num.toString())}
            className="h-10 bg-gray-600 hover:bg-gray-500"
          >
            {num}
          </Button>
        ))}
        <Button
          onClick={() => handleNumberClick(".")}
          className="h-10 bg-gray-600 hover:bg-gray-500"
        >
          .
        </Button>
        <Button
          onClick={() => handleNumberClick("0")}
          className="h-10 bg-gray-600 hover:bg-gray-500"
        >
          0
        </Button>
        <Button
          onClick={handleClear}
          className="h-10 bg-red-600 hover:bg-red-500"
        >
          Clear All
        </Button>
      </div>

      {/* Add to Batch Button */}
      <Button
        onClick={addToScrapBatch}
        disabled={parseFloat(display) <= 0}
        className="w-full h-12 bg-purple-600 hover:bg-purple-500 disabled:opacity-50"
      >
        Add to Batch
      </Button>

      {/* Batch Display */}
      {scrapBatch.length > 0 && (
        <Card className="bg-purple-900/30 border-purple-400/30 p-4">
          <h3 className="text-lg font-semibold text-purple-300 mb-3">Current Batch</h3>
          <div className="space-y-2 mb-4">
            {scrapBatch.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-black/30 p-2 rounded">
                <span className="text-white">
                  {item.weight}g {item.purity}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">${item.value.toFixed(2)}</span>
                  <Button
                    onClick={() => removeFromScrapBatch(item.id)}
                    size="sm"
                    variant="destructive"
                    className="h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-purple-400/30 pt-3">
            <div className="flex justify-between text-lg font-semibold">
              <span className="text-purple-300">Total: {getTotalScrapWeight()}g</span>
              <span className="text-green-400">${getTotalScrapValue()}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <Card className={cn("bg-black/50 backdrop-blur-sm border-white/20 p-6", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Live Interactive Demo</h3>
        <Badge variant="outline" className="border-yellow-400 text-yellow-400">
          Tutorial Mode
        </Badge>
      </div>
      
      {tutorialType === "basic" && renderBasicCalculator()}
      {tutorialType === "scrap" && renderScrapCalculator()}
      
      <div className="mt-4 text-xs text-gray-400 text-center">
        This is a live demonstration using real market data. Practice along with the tutorial!
      </div>
    </Card>
  );
}