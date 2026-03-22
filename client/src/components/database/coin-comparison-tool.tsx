import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, TrendingUp, Scale, Award, DollarSign } from "lucide-react";
import { formatCurrency, formatWeight } from "@/lib/calculator-utils";
import { useLivePricing } from "@/hooks/use-live-pricing";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

interface CoinData {
  id: number;
  name: string;
  type: string;
  yearStart: number;
  yearEnd?: number;
  purity: string;
  weight: string;
  diameter?: string;
  thickness?: string;
  mintage?: number;
  description?: string;
  specifications?: any;
}

export function CoinComparisonTool() {
  const [selectedCoins, setSelectedCoins] = useState<CoinData[]>([]);
  const { prices } = useLivePricing();
  
  const { data: coins } = useQuery<CoinData[]>({
    queryKey: ["/api/coins"],
  });

  const calculateMeltValue = (coin: CoinData) => {
    const weight = parseFloat(coin.weight);
    const purity = parseFloat(coin.purity);
    const metal = coin.type.toLowerCase();
    const price = prices ? (prices[metal as keyof typeof prices] || 0) : 0;
    return weight * purity * price;
  };

  const getRarityScore = (coin: CoinData) => {
    if (!coin.mintage) return 0;
    if (coin.mintage < 1000) return 10;
    if (coin.mintage < 10000) return 8;
    if (coin.mintage < 100000) return 6;
    if (coin.mintage < 1000000) return 4;
    return 2;
  };

  const getRarityLabel = (score: number) => {
    if (score >= 10) return { label: "Extremely Rare", color: "bg-red-500" };
    if (score >= 8) return { label: "Very Rare", color: "bg-orange-500" };
    if (score >= 6) return { label: "Rare", color: "bg-yellow-500" };
    if (score >= 4) return { label: "Scarce", color: "bg-blue-500" };
    return { label: "Common", color: "bg-gray-500" };
  };

  const addCoinToComparison = (coinId: string) => {
    const coin = coins?.find(c => c.id.toString() === coinId);
    if (coin && selectedCoins.length < 4 && !selectedCoins.find(c => c.id === coin.id)) {
      setSelectedCoins([...selectedCoins, coin]);
    }
  };

  const removeCoinFromComparison = (coinId: number) => {
    setSelectedCoins(selectedCoins.filter(c => c.id !== coinId));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Scale className="h-6 w-6" />
          Coin Comparison Tool
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Coin Selector */}
        <div className="flex items-center gap-4">
          <Select onValueChange={addCoinToComparison} value="">
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a coin to compare..." />
            </SelectTrigger>
            <SelectContent>
              {coins?.map(coin => (
                <SelectItem 
                  key={coin.id} 
                  value={coin.id.toString()}
                  disabled={selectedCoins.find(c => c.id === coin.id) !== undefined}
                >
                  {coin.name} ({coin.yearStart})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Badge variant="outline" className="px-4 py-2">
            {selectedCoins.length}/4 coins selected
          </Badge>
        </div>

        {/* Comparison Grid */}
        {selectedCoins.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedCoins.map(coin => {
              const rarityScore = getRarityScore(coin);
              const rarity = getRarityLabel(rarityScore);
              const meltValue = calculateMeltValue(coin);
              
              return (
                <Card key={coin.id} className="relative overflow-hidden">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => removeCoinFromComparison(coin.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  
                  <CardContent className="pt-8 space-y-4">
                    <div>
                      <h3 className="font-bold text-lg pr-8">{coin.name}</h3>
                      <p className="text-sm text-yellow-500">{coin.yearStart}</p>
                    </div>

                    {/* Rarity Badge */}
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <Badge className={`${rarity.color} text-white`}>
                        {rarity.label}
                      </Badge>
                    </div>

                    {/* Specs */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-yellow-500">Metal</span>
                        <span className="font-medium text-white">{coin.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-500">Purity</span>
                        <span className="font-medium text-white">{(parseFloat(coin.purity) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-500">Weight</span>
                        <span className="font-medium text-white">{formatWeight(parseFloat(coin.weight))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-500">Diameter</span>
                        <span className="font-medium text-white">{coin.diameter || '—'}mm</span>
                      </div>
                      {coin.mintage && (
                        <div className="flex justify-between">
                          <span className="text-yellow-500">Mintage</span>
                          <span className="font-medium text-white">{coin.mintage.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Value */}
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-yellow-500">Melt Value</span>
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp className="h-4 w-4" />
                          <span className="font-bold">{formatCurrency(meltValue)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Score Bars */}
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Rarity</span>
                          <span>{rarityScore}/10</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${rarity.color}`}
                            style={{ width: `${rarityScore * 10}%` }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Value Score</span>
                          <span>{Math.min(Math.round(meltValue / 100), 10)}/10</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500"
                            style={{ width: `${Math.min(meltValue / 10, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {selectedCoins.length < 4 && (
              <Card className="border-2 border-dashed border-gray-300 flex items-center justify-center min-h-[400px]">
                <div className="text-center p-6">
                  <Plus className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
                  <p className="text-yellow-500">Add another coin to compare</p>
                </div>
              </Card>
            )}
          </div>
        ) : (
          <Card className="border-2 border-dashed border-gray-300 p-12">
            <div className="text-center">
              <Scale className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
              <p className="text-xl text-yellow-500 mb-2">No coins selected for comparison</p>
              <p className="text-yellow-400">Select up to 4 coins from the dropdown above</p>
            </div>
          </Card>
        )}

        {/* Comparison Summary */}
        {selectedCoins.length >= 2 && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Comparison Summary</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-yellow-500 mb-1">Highest Value</p>
                  <p className="font-bold text-white">
                    {selectedCoins.reduce((max, coin) => 
                      calculateMeltValue(coin) > calculateMeltValue(max) ? coin : max
                    ).name}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-yellow-500 mb-1">Rarest Coin</p>
                  <p className="font-bold text-white">
                    {selectedCoins.reduce((rarest, coin) => 
                      getRarityScore(coin) > getRarityScore(rarest) ? coin : rarest
                    ).name}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-yellow-500 mb-1">Oldest Coin</p>
                  <p className="font-bold text-white">
                    {selectedCoins.reduce((oldest, coin) => 
                      coin.yearStart < oldest.yearStart ? coin : oldest
                    ).name}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-yellow-500 mb-1">Total Value</p>
                  <p className="font-bold text-green-600">
                    {formatCurrency(selectedCoins.reduce((sum, coin) => sum + calculateMeltValue(coin), 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}