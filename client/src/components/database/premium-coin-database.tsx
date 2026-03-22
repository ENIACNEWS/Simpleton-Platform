import { useState, useMemo } from "react";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Loader2, 
  Search, 
  TrendingUp, 
  Calendar, 
  Weight, 
  Coins, 
  DollarSign,
  Sparkles,
  Globe,
  Filter,
  ChevronDown,
  Diamond,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatWeight } from "@/lib/calculator-utils";
import { useLivePricing } from "@/hooks/use-live-pricing";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

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

const countryMap: Record<string, string[]> = {
  "United States": ["American", "Liberty", "Indian", "Saint-Gaudens", "Morgan", "Peace", "Walking", "Franklin", "Kennedy", "Flowing", "Draped", "Seated", "Trade", "Barber", "Standing", "Washington", "Roosevelt", "Mercury", "Jefferson", "Lincoln", "Flying", "Shield", "Buffalo", "Capped", "Coronet", "Columbus", "Mount", "Constitution", "Susan", "Sacagawea", "Presidential", "State", "Beautiful", "Half Disme", "Birch", "1933", "California", "Clark", "Classic", "Three Dollar", "Gold Dollar", "World War", "Olympic", "Library of Congress"],
  "Canada": ["Canadian", "Maple Leaf", "Wildlife"],
  "South Africa": ["Krugerrand", "African", "Kruger Pond"],
  "China": ["Chinese", "Panda", "Tael"],
  "Australia": ["Australian", "Kangaroo", "Kookaburra", "Lunar", "Adelaide Pound"],
  "Austria": ["Austrian", "Philharmonic", "Corona", "Ducat"],
  "United Kingdom": ["British", "Britannia", "Sovereign", "Guinea"],
  "Mexico": ["Mexican", "Libertad", "Centenario", "Peso", "Doubloon", "Spanish Colonial", "Escudo"],
  "France": ["French", "Franc", "Rooster", "Napoleon", "Angel"],
  "Switzerland": ["Swiss", "Helvetia"],
  "Netherlands": ["Netherlands", "Guilder"],
  "Japan": ["Japanese", "Koban"],
  "Iran": ["Iranian", "Pahlavi", "Azadi", "Emami"],
  "Russia": ["Russian", "Saint George"],
  "Turkey": ["Ottoman", "Turkish", "Altin"],
  "Israel": ["Israeli", "Jerusalem of Gold"],
  "Somalia": ["Somalian", "Elephant"],
  "Ancient / Historical": ["Roman", "Byzantine", "Venetian", "Aureus", "Solidus", "Zecchino"],
};

const metalTypes = ["gold", "silver", "platinum", "palladium", "copper"];

function getCountryForCoin(coinName: string): string {
  for (const [country, keywords] of Object.entries(countryMap)) {
    if (keywords.some(keyword => coinName.includes(keyword))) {
      return country;
    }
  }
  return "Other";
}

export function PremiumCoinDatabase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedMetal, setSelectedMetal] = useState<string>("all");
  const [yearRange, setYearRange] = useState<{ start: string; end: string }>({
    start: "",
    end: ""
  });
  const [purityRange, setPurityRange] = useState<{ min: string; max: string }>({
    min: "",
    max: ""
  });
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  
  const { data: coins, isLoading } = useQuery<CoinData[]>({
    queryKey: ["/api/coins"],
  });

  const { prices } = useLivePricing();

  // Fetch FRED economic data
  const { data: economicData, isLoading: economicLoading } = useQuery({
    queryKey: ["/api/free-apis/economics"],
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch Alpha Vantage stock data
  const { data: stockData, isLoading: stockLoading } = useQuery({
    queryKey: ["/api/free-apis/stocks"],
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch coin-specific data
  const { data: coinApiData, isLoading: coinApiLoading } = useQuery({
    queryKey: ["/api/free-apis/coins"],
    refetchInterval: 60000, // Refresh every minute
  });

  const filteredCoins = useMemo(() => {
    if (!coins) return [];

    return coins.filter(coin => {
      // Search filter
      const matchesSearch = !searchQuery || 
        coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coin.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Country filter
      const coinCountry = getCountryForCoin(coin.name);
      const matchesCountry = selectedCountry === "all" || coinCountry === selectedCountry;

      // Metal filter
      const matchesMetal = selectedMetal === "all" || coin.type === selectedMetal;

      // Year range filter
      const matchesYearStart = !yearRange.start || coin.yearStart >= parseInt(yearRange.start);
      const matchesYearEnd = !yearRange.end || (coin.yearEnd || coin.yearStart) <= parseInt(yearRange.end);

      // Purity filter
      const purity = parseFloat(coin.purity);
      const matchesPurityMin = !purityRange.min || purity >= parseFloat(purityRange.min);
      const matchesPurityMax = !purityRange.max || purity <= parseFloat(purityRange.max);

      return matchesSearch && matchesCountry && matchesMetal && 
             matchesYearStart && matchesYearEnd && 
             matchesPurityMin && matchesPurityMax;
    });
  }, [coins, searchQuery, selectedCountry, selectedMetal, yearRange, purityRange]);

  // Group coins by country
  const coinsByCountry = useMemo(() => {
    const grouped: Record<string, CoinData[]> = {};
    
    filteredCoins.forEach(coin => {
      const country = getCountryForCoin(coin.name);
      if (!grouped[country]) {
        grouped[country] = [];
      }
      grouped[country].push(coin);
    });

    // Sort countries with US first
    const sortedCountries = Object.keys(grouped).sort((a, b) => {
      if (a === "United States") return -1;
      if (b === "United States") return 1;
      return a.localeCompare(b);
    });

    const sorted: Record<string, CoinData[]> = {};
    sortedCountries.forEach(country => {
      sorted[country] = grouped[country].sort((a, b) => b.yearStart - a.yearStart);
    });

    return sorted;
  }, [filteredCoins]);

  const calculateMeltValue = (coin: CoinData) => {
    const weight = parseFloat(coin.weight);
    const purity = parseFloat(coin.purity);
    
    if (!prices) return 0;
    
    if (coin.type === "gold" && prices.gold) {
      return weight * purity * prices.gold;
    } else if (coin.type === "silver" && prices.silver) {
      return weight * purity * prices.silver;
    } else if (coin.type === "platinum" && prices.platinum) {
      return weight * purity * prices.platinum;
    } else if (coin.type === "palladium" && prices.palladium) {
      return weight * purity * prices.palladium;
    }
    return 0;
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCountry("all");
    setSelectedMetal("all");
    setYearRange({ start: "", end: "" });
    setPurityRange({ min: "", max: "" });
  };

  const activeFiltersCount = [
    selectedCountry !== "all",
    selectedMetal !== "all",
    yearRange.start || yearRange.end,
    purityRange.min || purityRange.max
  ].filter(Boolean).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-gold">
          <Diamond className="h-5 w-5" />
          <span className="text-sm font-light tracking-widest uppercase">Premium Collection</span>
          <Diamond className="h-5 w-5" />
        </div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-gold via-yellow-400 to-gold bg-clip-text text-transparent">
          World Precious Metals Registry
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore our comprehensive database of {coins?.length || 0} rare and valuable coins from mints worldwide
        </p>
      </div>

      {/* Economic Intelligence Section */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* FRED Economic Data */}
        <Card className="glass-morphism border-gold/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-6 w-6 text-blue-400" />
              <h3 className="text-xl font-semibold">Economic Intelligence</h3>
            </div>
            {economicLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
              </div>
            ) : (
              <div className="space-y-4">
                {economicData?.success && economicData?.data?.fred && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Federal Reserve Economic Data</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Gold Price Series</span>
                      <Badge variant="outline" className="text-blue-400 border-blue-400">
                        ${economicData.data.fred[0]?.value.toFixed(2)}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Source: Federal Reserve Economic Data (FRED)
                    </div>
                  </div>
                )}
                {economicData?.success && economicData?.data?.worldBank && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">World Bank Economic Data</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">US GDP</span>
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        ${(economicData.data.worldBank[0]?.gdp / 1000000000000).toFixed(1)}T
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Source: World Bank API
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alpha Vantage Stock Data */}
        <Card className="glass-morphism border-gold/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="h-6 w-6 text-green-400" />
              <h3 className="text-xl font-semibold">Market Intelligence</h3>
            </div>
            {stockLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-green-400" />
              </div>
            ) : (
              <div className="space-y-4">
                {stockData?.success && stockData?.data?.apple && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Market Leader</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Apple Inc. (AAPL)</span>
                      <Badge variant="outline" className={`${stockData.data.apple.change > 0 ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400'}`}>
                        ${stockData.data.apple.price} ({stockData.data.apple.changePercent})
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Source: Alpha Vantage
                    </div>
                  </div>
                )}
                {stockData?.success && stockData?.data?.gold && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Gold Futures</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Gold (GC=F)</span>
                      <Badge variant="outline" className={`${stockData.data.gold.change > 0 ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400'}`}>
                        ${stockData.data.gold.price} ({stockData.data.gold.changePercent})
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Source: Yahoo Finance
                    </div>
                  </div>
                )}
                {stockData?.success && stockData?.data?.silver && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Silver Futures</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Silver (SI=F)</span>
                      <Badge variant="outline" className={`${stockData.data.silver.change > 0 ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400'}`}>
                        ${stockData.data.silver.price} ({stockData.data.silver.changePercent})
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Source: Yahoo Finance
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Advanced Search Bar */}
      <div className="glass-morphism p-6 rounded-xl border border-gold/10">
        <div className="space-y-4">
          {/* Main Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by coin name, description, or specifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-12 text-lg bg-black/50 border-gold/20 focus:border-gold"
            />
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-3">
            {/* Country Dropdown */}
            <Popover open={countryOpen} onOpenChange={setCountryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={countryOpen}
                  className="min-w-[200px] justify-between border-gold/20 hover:border-gold"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  {selectedCountry === "all" ? "All Countries" : selectedCountry}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-0 glass-morphism border-gold/20">
                <Command>
                  <CommandInput placeholder="Search countries..." />
                  <CommandList>
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="all"
                        onSelect={() => {
                          setSelectedCountry("all");
                          setCountryOpen(false);
                        }}
                      >
                        All Countries
                      </CommandItem>
                      {Object.keys(countryMap).map((country) => (
                        <CommandItem
                          key={country}
                          value={country}
                          onSelect={() => {
                            setSelectedCountry(country);
                            setCountryOpen(false);
                          }}
                        >
                          {country}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Metal Type Dropdown */}
            <Select value={selectedMetal} onValueChange={setSelectedMetal}>
              <SelectTrigger className="min-w-[150px] border-gold/20 hover:border-gold">
                <Coins className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Metal Type" />
              </SelectTrigger>
              <SelectContent className="glass-morphism border-gold/20">
                <SelectItem value="all">All Metals</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
                <SelectItem value="palladium">Palladium</SelectItem>
                <SelectItem value="copper">Copper</SelectItem>
              </SelectContent>
            </Select>

            {/* Advanced Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className={cn(
                "border-gold/20 hover:border-gold",
                showAdvancedSearch && "bg-gold/10"
              )}
            >
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 bg-gold text-yellow-900">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="hover:text-gold"
              >
                <X className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedSearch && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gold/10">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Year From</label>
                <Input
                  type="number"
                  placeholder="e.g., 1900"
                  value={yearRange.start}
                  onChange={(e) => setYearRange({ ...yearRange, start: e.target.value })}
                  className="bg-black/50 border-gold/20 focus:border-gold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Year To</label>
                <Input
                  type="number"
                  placeholder="e.g., 2025"
                  value={yearRange.end}
                  onChange={(e) => setYearRange({ ...yearRange, end: e.target.value })}
                  className="bg-black/50 border-gold/20 focus:border-gold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Min Purity</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 0.900"
                  value={purityRange.min}
                  onChange={(e) => setPurityRange({ ...purityRange, min: e.target.value })}
                  className="bg-black/50 border-gold/20 focus:border-gold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Max Purity</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 0.999"
                  value={purityRange.max}
                  onChange={(e) => setPurityRange({ ...purityRange, max: e.target.value })}
                  className="bg-black/50 border-gold/20 focus:border-gold"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Found {filteredCoins.length} coins matching your criteria
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-gold" />
          Live prices updated
        </div>
      </div>

      {/* Coins by Country */}
      <ScrollArea className="h-[800px] rounded-xl border border-gold/10">
        <Accordion type="multiple" className="w-full" defaultValue={["United States"]}>
          {Object.entries(coinsByCountry).map(([country, countryCoins]) => (
            <AccordionItem key={country} value={country} className="border-gold/10">
              <AccordionTrigger className="hover:no-underline px-6 py-4 glass-morphism">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-gold" />
                    <span className="text-lg font-semibold">{country}</span>
                    <Badge variant="secondary" className="bg-gold/10 text-gold border-gold/20">
                      {countryCoins.length} coins
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {countryCoins.filter(c => c.type === "gold").length > 0 && (
                      <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                        {countryCoins.filter(c => c.type === "gold").length} Gold
                      </Badge>
                    )}
                    {countryCoins.filter(c => c.type === "silver").length > 0 && (
                      <Badge variant="outline" className="border-gray-400 text-yellow-400">
                        {countryCoins.filter(c => c.type === "silver").length} Silver
                      </Badge>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="grid gap-4">
                  {countryCoins.map((coin) => {
                    const meltValue = calculateMeltValue(coin);
                    
                    return (
                      <Card key={coin.id} className="glass-morphism border-gold/10 hover:border-gold/30 transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="grid md:grid-cols-3 gap-6">
                            {/* Coin Info */}
                            <div className="md:col-span-2 space-y-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-xl font-bold text-gold">{coin.name}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {coin.yearStart} {coin.yearEnd ? `- ${coin.yearEnd}` : ''}
                                  </p>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "capitalize",
                                    coin.type === "gold" && "border-yellow-600 text-yellow-600",
                                    coin.type === "silver" && "border-gray-400 text-yellow-400",
                                    coin.type === "platinum" && "border-purple-400 text-purple-400",
                                    coin.type === "palladium" && "border-blue-400 text-blue-400"
                                  )}
                                >
                                  {coin.type}
                                </Badge>
                              </div>
                              
                              {coin.description && (
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {coin.description}
                                </p>
                              )}

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-yellow-500">Weight</p>
                                  <p className="font-semibold text-white">{formatWeight(parseFloat(coin.weight))}</p>
                                </div>
                                <div>
                                  <p className="text-yellow-500">Purity</p>
                                  <p className="font-semibold text-white">{(parseFloat(coin.purity) * 100).toFixed(1)}%</p>
                                </div>
                                {coin.diameter && (
                                  <div>
                                    <p className="text-yellow-500">Diameter</p>
                                    <p className="font-semibold text-white">{coin.diameter} mm</p>
                                  </div>
                                )}
                                {coin.mintage && (
                                  <div>
                                    <p className="text-yellow-500">Mintage</p>
                                    <p className="font-semibold text-white">{coin.mintage.toLocaleString()}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Melt Value */}
                            <div className="flex flex-col justify-center items-center p-6 glass-morphism rounded-lg border border-gold/10">
                              <p className="text-sm text-yellow-500 mb-2">Current Melt Value</p>
                              <p className="text-3xl font-bold text-gold">
                                {formatCurrency(meltValue)}
                              </p>
                              <div className="flex items-center gap-1 mt-2 text-green-500">
                                <TrendingUp className="h-4 w-4" />
                                <span className="text-sm text-white">Live Price</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </div>
  );
}