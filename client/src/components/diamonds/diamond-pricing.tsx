import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Info,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { formatCurrency } from "@/lib/calculator-utils";

interface DiamondPrice {
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  pricePerCarat: number;
  totalPrice: number;
  changePercent: number;
  lastUpdated: string;
}

export function DiamondPricing() {
  const [prices, setPrices] = useState<DiamondPrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(false);

  // Mock data for demonstration (replace with real API data)
  const mockPrices: DiamondPrice[] = [
    {
      shape: "Round",
      carat: 1.0,
      color: "G",
      clarity: "VS2",
      cut: "Excellent",
      pricePerCarat: 6500,
      totalPrice: 6500,
      changePercent: 2.3,
      lastUpdated: new Date().toISOString()
    },
    {
      shape: "Princess",
      carat: 0.75,
      color: "H",
      clarity: "SI1",
      cut: "Very Good",
      pricePerCarat: 4200,
      totalPrice: 3150,
      changePercent: -1.2,
      lastUpdated: new Date().toISOString()
    },
    {
      shape: "Emerald",
      carat: 1.5,
      color: "F",
      clarity: "VVS2",
      cut: "Excellent",
      pricePerCarat: 8900,
      totalPrice: 13350,
      changePercent: 3.7,
      lastUpdated: new Date().toISOString()
    }
  ];

  useEffect(() => {
    // Check if diamond API is configured
    // For now, we'll use mock data
    setPrices(mockPrices);
  }, []);

  const fetchLatestPrices = async () => {
    setIsLoading(true);
    try {
      // In production, this would call the actual diamond pricing API
      // For example: RapNet, StoneAlgo, or IDEX
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setPrices(mockPrices);
    } catch (error) {
      console.error("Error fetching diamond prices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Average price by carat weight
  const caratPriceRanges = [
    { range: "0.50ct", avgPrice: "$2,500 - $5,000", premium: "Base" },
    { range: "0.75ct", avgPrice: "$3,500 - $8,000", premium: "+40%" },
    { range: "1.00ct", avgPrice: "$5,000 - $18,000", premium: "+100%" },
    { range: "1.50ct", avgPrice: "$9,000 - $30,000", premium: "+280%" },
    { range: "2.00ct", avgPrice: "$15,000 - $60,000", premium: "+500%" },
    { range: "3.00ct", avgPrice: "$30,000 - $120,000", premium: "+1100%" }
  ];

  return (
    <div className="space-y-8">
      {/* API Configuration Alert */}
      {!apiConfigured && (
        <Alert className="bg-blue-950/50 border-blue-400/50">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>To enable real-time diamond pricing, configure one of these APIs:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">RapNet ($699/year)</Badge>
                <Badge variant="outline">StoneAlgo (Free tier)</Badge>
                <Badge variant="outline">IDEX Online</Badge>
                <Badge variant="outline">Nivoda (Commission-based)</Badge>
              </div>
              <p className="text-sm text-yellow-400 mt-2">Currently showing sample market data.</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Market Overview */}
      <Card className="glass-morphism p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-blue-400" />
            <h2 className="text-3xl font-bold text-yellow-900">Diamond Market Pricing</h2>
          </div>
          <Button 
            onClick={fetchLatestPrices} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-black/30 border-blue-400/20">
            <h3 className="text-sm text-yellow-400 mb-1">Market Average (1ct)</h3>
            <div className="text-2xl font-bold text-blue-400">$9,249.78</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="h-4 w-4 text-red-400" />
              <span className="text-sm text-red-400">-2.7% this month</span>
            </div>
          </Card>
          
          <Card className="p-4 bg-black/30 border-gold/20">
            <h3 className="text-sm text-yellow-400 mb-1">Lab-Grown Discount</h3>
            <div className="text-2xl font-bold text-gold">-87%</div>
            <p className="text-xs text-yellow-500 mt-1">vs. natural diamonds</p>
          </Card>
          
          <Card className="p-4 bg-black/30 border-green-400/20">
            <h3 className="text-sm text-yellow-400 mb-1">Best Value Grade</h3>
            <div className="text-2xl font-bold text-green-400">G VS2</div>
            <p className="text-xs text-yellow-500 mt-1">Excellent cut only</p>
          </Card>
        </div>

        {/* Sample Prices Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-yellow-900">Shape</th>
                <th className="text-left py-3 px-4 text-yellow-900">Specs</th>
                <th className="text-right py-3 px-4 text-yellow-900">$/Carat</th>
                <th className="text-right py-3 px-4 text-yellow-900">Total Price</th>
                <th className="text-right py-3 px-4 text-yellow-900">Change</th>
              </tr>
            </thead>
            <tbody>
              {prices.map((price, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-black/30">
                  <td className="py-3 px-4 text-yellow-900">{price.shape}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{price.carat}ct</Badge>
                      <Badge variant="outline" className="text-xs">{price.color}</Badge>
                      <Badge variant="outline" className="text-xs">{price.clarity}</Badge>
                      <Badge variant="outline" className="text-xs">{price.cut}</Badge>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 font-mono text-yellow-900">
                    {formatCurrency(price.pricePerCarat)}
                  </td>
                  <td className="text-right py-3 px-4 font-mono font-semibold text-yellow-900">
                    {formatCurrency(price.totalPrice)}
                  </td>
                  <td className="text-right py-3 px-4">
                    <div className={`flex items-center justify-end gap-1 ${
                      price.changePercent > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {price.changePercent > 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span>{Math.abs(price.changePercent)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Price by Carat Weight */}
      <Card className="glass-morphism p-8">
        <div className="flex items-center gap-3 mb-6">
          <DollarSign className="h-8 w-8 text-blue-400" />
          <h2 className="text-3xl font-bold">Price Ranges by Carat Weight</h2>
        </div>
        <p className="text-yellow-300 mb-6">
          Average prices for round brilliant diamonds, G color, VS2 clarity, Excellent cut
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {caratPriceRanges.map((range) => (
            <Card key={range.range} className="p-6 bg-black/30 border-gold/20">
              <div className="text-2xl font-bold text-gold mb-2">{range.range}</div>
              <div className="text-lg mb-1">{range.avgPrice}</div>
              <div className="text-sm text-yellow-400">
                <Badge variant="outline" className="text-xs">{range.premium}</Badge>
                <span className="ml-2">vs 0.50ct</span>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Market Insights */}
      <Card className="glass-morphism p-8">
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle className="h-8 w-8 text-blue-400" />
          <h2 className="text-3xl font-bold">Current Market Insights</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gold">Market Trends</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <TrendingDown className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Natural Diamond Prices Declining</p>
                  <p className="text-sm text-yellow-400">Down 2.7% in April 2025, expected to stabilize</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Supply Constraints Ahead</p>
                  <p className="text-sm text-yellow-400">De Beers cutting 2025 production by 33%</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Lab-Grown Market Share Growing</p>
                  <p className="text-sm text-yellow-400">Now 87% cheaper than natural diamonds</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-gold">Investment Tips</h3>
            <ul className="space-y-3 text-sm text-yellow-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>1-2ct rounds with D-F color hold value best</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>Fancy shapes trade 20-40% below rounds</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>GIA certification adds 5-10% to resale value</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>Avoid I1-I3 clarity for investment purposes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>Consider rare fancy colors for appreciation</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>


    </div>
  );
}