import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, 
  Search, 
  TrendingUp, 
  Calendar, 
  Weight, 
  Coins, 
  DollarSign,
  Sparkles,
  Info,
  ChevronRight,
  Filter
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatWeight } from "@/lib/calculator-utils";
import { useLivePricing } from "@/hooks/use-live-pricing";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SERIES_OVERVIEW, getCoinSeries, type SeriesOverview } from "@/data/coin-price-guide";

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
  imageUrl?: string;
  createdAt: string;
}

export function CoinDatabase() {
  const [searchTerm, setSearchTerm] = useState("");
  const [metalType, setMetalType] = useState<string>("all");
  const [yearRange, setYearRange] = useState<string>("all");
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [sortBy, setSortBy] = useState<string>("oldest");
  const { prices } = useLivePricing();

  const { data: coins, isLoading } = useQuery<CoinData[]>({
    queryKey: ["/api/coins", { type: metalType, yearRange, search: searchTerm }],
  });

  const calculateMeltValue = (coin: CoinData) => {
    const weight = parseFloat(coin.weight);
    const purity = parseFloat(coin.purity);
    const metal = coin.type.toLowerCase();
    const price = prices ? (prices[metal as keyof typeof prices] || 0) : 0;
    
    return weight * purity * price;
  };

  const filteredCoins = coins?.filter(coin => {
    const matchesSearch = coin.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = metalType === "all" || coin.type === metalType;
    const matchesYear = yearRange === "all" || 
      (yearRange === "pre1900" && coin.yearStart < 1900) ||
      (yearRange === "1900-1950" && coin.yearStart >= 1900 && coin.yearStart <= 1950) ||
      (yearRange === "post1950" && coin.yearStart > 1950);
    
    return matchesSearch && matchesType && matchesYear;
  })?.sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return a.yearStart - b.yearStart;
      case "newest":
        return b.yearStart - a.yearStart;
      case "value":
        return calculateMeltValue(b) - calculateMeltValue(a);
      default:
        return 0;
    }
  });

  const metalColors = {
    gold: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900",
    silver: "bg-gradient-to-r from-gray-300 to-gray-500 text-yellow-900",
    platinum: "bg-gradient-to-r from-gray-400 to-gray-600 text-white",
    palladium: "bg-gradient-to-r from-gray-200 to-gray-400 text-yellow-900"
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-gold" />
        <p className="text-yellow-500">Loading coin collection...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Simple Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-gold to-yellow-400 bg-clip-text text-transparent">
          Comprehensive Coin Database
        </h1>
        <p className="text-white dark:text-yellow-400 text-lg">Explore our comprehensive database of rare valuable coins from mints worldwide</p>
      </div>

      {/* Simple Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by coin name, description or specifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg bg-black text-white placeholder:text-gray-400 border-gray-600"
            />
          </div>
          
          {/* Advanced Filters */}
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-white dark:text-yellow-400 mb-3">Advanced Filters</h3>
          </div>
          
          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-white dark:text-yellow-400 mb-2">Country</label>
              <Select value={metalType} onValueChange={setMetalType}>
                <SelectTrigger className="h-12">
                  <Coins className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Metal Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">✨ All Metals</SelectItem>
                  <SelectItem value="gold">🟡 Gold Only</SelectItem>
                  <SelectItem value="silver">⚪ Silver Only</SelectItem>
                  <SelectItem value="platinum">🔷 Platinum Only</SelectItem>
                  <SelectItem value="palladium">💎 Palladium Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white dark:text-yellow-400 mb-2">Copper</label>
              <Select value={yearRange} onValueChange={setYearRange}>
                <SelectTrigger className="h-12">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Year Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">📅 All Years</SelectItem>
                  <SelectItem value="pre1900">🏛️ Historic (Pre-1900)</SelectItem>
                  <SelectItem value="1900-1950">🏛️ Classic (1900-1950)</SelectItem>
                  <SelectItem value="post1950">✨ Modern (Post-1950)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white dark:text-yellow-400 mb-2">Platinum</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-12">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oldest">📅 Oldest First</SelectItem>
                  <SelectItem value="newest">🆕 Newest First</SelectItem>
                  <SelectItem value="value">💰 Highest Value</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col justify-end">
              <div className="text-center text-lg font-semibold text-white dark:text-yellow-400">
                Found {filteredCoins?.length || 0} coins
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Coin Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCoins?.map((coin) => (
          <Card 
            key={coin.id} 
            className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
            onClick={() => setSelectedCoin(coin)}
          >
            <div className={`h-2 ${metalColors[coin.type as keyof typeof metalColors] || 'bg-gray-500'}`} />
            
            <div className="p-6">
              {/* Coin Header */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold pr-2 text-white dark:text-white">{coin.name}</h3>
                <Badge className={`${metalColors[coin.type as keyof typeof metalColors]} px-3 py-1`}>
                  {coin.type.toUpperCase()}
                </Badge>
              </div>

              {/* Simple Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-yellow-500 mb-1">Years</p>
                  <p className="font-semibold text-white dark:text-white">
                    {coin.yearStart}{coin.yearEnd && coin.yearEnd !== coin.yearStart ? `-${coin.yearEnd}` : ''}
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-yellow-500 mb-1">Purity</p>
                  <p className="font-semibold text-white dark:text-white">{(parseFloat(coin.purity) * 100).toFixed(1)}%</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-yellow-500 mb-1">Weight</p>
                  <p className="font-semibold text-white dark:text-white">{formatWeight(parseFloat(coin.weight))}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-yellow-500 mb-1">Size</p>
                  <p className="font-semibold text-white dark:text-white">{coin.diameter || '—'}mm</p>
                </div>
              </div>

              {/* Live Value Box */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-700 dark:text-green-400">Live Melt Value</span>
                  </div>
                  <span className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {formatCurrency(calculateMeltValue(coin))}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCoin(coin);
                  }}
                  className="text-white border-white hover:bg-white hover:text-black"
                >
                  Compare
                </Button>
                
                <Button 
                  size="sm"
                  variant="outline"
                  className="text-white border-white hover:bg-white hover:text-black"
                >
                  Portfolio
                </Button>
                
                <Button 
                  size="sm"
                  variant="outline"
                  className="text-white border-white hover:bg-white hover:text-black"
                >
                  Spot Prices
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredCoins?.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <Coins className="h-16 w-16 mx-auto mb-4 text-yellow-300" />
            <p className="text-xl text-yellow-500 mb-2">No coins found</p>
            <p className="text-yellow-400">Try adjusting your search or filters</p>
          </div>
        </Card>
      )}

      {/* Detailed Coin Modal */}
      <Dialog open={!!selectedCoin} onOpenChange={() => setSelectedCoin(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          {selectedCoin && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl">{selectedCoin.name}</DialogTitle>
                    <DialogDescription className="text-lg mt-2">
                      {selectedCoin.yearStart}{selectedCoin.yearEnd && selectedCoin.yearEnd !== selectedCoin.yearStart ? `-${selectedCoin.yearEnd}` : ''}
                    </DialogDescription>
                  </div>
                  <Badge className={`${metalColors[selectedCoin.type as keyof typeof metalColors]} px-4 py-2 text-lg`}>
                    {selectedCoin.type.toUpperCase()}
                  </Badge>
                </div>
              </DialogHeader>

              <ScrollArea className="max-h-[70vh] pr-4">
                <Tabs defaultValue="overview" className="mt-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="specifications">Specifications</TabsTrigger>
                    <TabsTrigger value="value">Value & Pricing</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 mt-6">
                    <div className="prose prose-gray max-w-none">
                      <p className="text-lg leading-relaxed text-white">{selectedCoin.description}</p>
                    </div>

                    {selectedCoin.mintage && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <p className="text-sm text-yellow-500 mb-1">Total Mintage</p>
                        <p className="text-2xl font-bold text-white">{selectedCoin.mintage.toLocaleString()}</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="specifications" className="mt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                          <p className="text-sm text-yellow-500 mb-2">Metal Content</p>
                          <p className="text-xl font-bold text-white">{(parseFloat(selectedCoin.purity) * 100).toFixed(2)}% Pure</p>
                          <p className="text-sm text-white mt-1">
                            {selectedCoin.specifications?.composition || `${(parseFloat(selectedCoin.purity) * 100).toFixed(1)}% ${selectedCoin.type}`}
                          </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                          <p className="text-sm text-yellow-500 mb-2">Weight</p>
                          <p className="text-xl font-bold text-white">{formatWeight(parseFloat(selectedCoin.weight))}</p>
                          <p className="text-sm text-white mt-1">
                            {(parseFloat(selectedCoin.weight) * 31.1035).toFixed(2)} grams
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                          <p className="text-sm text-yellow-500 mb-2">Dimensions</p>
                          <p className="text-xl font-bold text-white">{selectedCoin.diameter || '—'}mm</p>
                          <p className="text-sm text-white mt-1">
                            Thickness: {selectedCoin.thickness || '—'}mm
                          </p>
                        </div>

                        {selectedCoin.specifications && (
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <p className="text-sm text-yellow-500 mb-2">Additional Details</p>
                            <div className="space-y-1 text-sm text-white">
                              {selectedCoin.specifications.designer && (
                                <p><span className="font-medium text-white">Designer:</span> {selectedCoin.specifications.designer}</p>
                              )}
                              {selectedCoin.specifications.edge && (
                                <p><span className="font-medium text-white">Edge:</span> {selectedCoin.specifications.edge}</p>
                              )}
                              {selectedCoin.specifications.mintMarks && (
                                <p><span className="font-medium text-white">Mint Marks:</span> {selectedCoin.specifications.mintMarks.join(', ')}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="value" className="mt-6">
                    <div className="space-y-4">
                      {/* Melt Value Card */}
                      <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-5 border border-green-500/20">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm text-green-400">Current Melt Value</p>
                            <p className="text-3xl font-bold text-green-300">
                              {formatCurrency(calculateMeltValue(selectedCoin))}
                            </p>
                          </div>
                          <Sparkles className="h-8 w-8 text-green-400" />
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-yellow-500">Metal Price</p>
                            <p className="font-semibold text-white">
                              {formatCurrency(prices ? (prices[selectedCoin.type.toLowerCase() as keyof typeof prices] || 0) : 0)}/oz
                            </p>
                          </div>
                          <div>
                            <p className="text-yellow-500">Pure Metal Content</p>
                            <p className="font-semibold text-white">
                              {(parseFloat(selectedCoin.weight) * parseFloat(selectedCoin.purity)).toFixed(4)} oz
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Collector Value Range */}
                      {selectedCoin.specifications?.estimatedValue && (
                        <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4">
                          <p className="text-sm text-blue-400 mb-1 font-semibold">Collector Value Range</p>
                          <p className="text-xl font-bold text-white">{selectedCoin.specifications.estimatedValue}</p>
                          <p className="text-xs text-gray-400 mt-1">Values vary by grade, rarity, and market conditions</p>
                        </div>
                      )}

                      {/* Series Price Guide — Key Dates */}
                      {(() => {
                        const seriesData = getCoinSeries(selectedCoin.name);
                        if (!seriesData) return null;
                        return (
                          <div className="space-y-3">
                            {/* Series Investment Advice */}
                            <div className="bg-amber-900/20 border border-amber-500/20 rounded-lg p-4">
                              <p className="text-sm text-amber-400 font-semibold mb-2">Investment Analysis</p>
                              <p className="text-sm text-gray-200 leading-relaxed">{seriesData.investmentAdvice}</p>
                            </div>

                            {/* Key Dates & Rarities Table */}
                            <div className="bg-gray-800/60 border border-white/10 rounded-lg p-4">
                              <p className="text-sm text-yellow-400 font-semibold mb-3">Key Dates & Rarities (Red Book Guide)</p>
                              <div className="space-y-2">
                                {seriesData.keyDatesAndRarities.map((kd, idx) => (
                                  <div key={idx} className="border border-white/5 rounded p-2.5 bg-white/5">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                      <p className="text-sm font-bold text-white">{kd.date}</p>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-1.5">{kd.description}</p>
                                    <p className="text-xs text-green-300 font-mono leading-relaxed">{kd.value}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Series Composition */}
                            <div className="bg-gray-800/40 border border-white/10 rounded-lg p-3">
                              <p className="text-xs text-yellow-400 font-semibold mb-1">Composition History</p>
                              <p className="text-xs text-gray-300 leading-relaxed">{seriesData.composition}</p>
                            </div>
                          </div>
                        );
                      })()}

                      <p className="text-xs text-gray-500 text-center pt-1">
                        Values based on Red Book / Blue Book / Gray Sheet reference data. Market prices fluctuate.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}