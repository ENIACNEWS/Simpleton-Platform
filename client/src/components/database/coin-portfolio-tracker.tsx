import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Wallet, 
  TrendingUp, 
  Download, 
  Trash2, 
  Edit, 
  Save,
  X,
  PieChart,
  BarChart3,
  DollarSign
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatWeight } from "@/lib/calculator-utils";
import { useLivePricing } from "@/hooks/use-live-pricing";
import { useQuery } from "@tanstack/react-query";
import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface CoinData {
  id: number;
  name: string;
  type: string;
  yearStart: number;
  yearEnd?: number;
  purity: string;
  weight: string;
}

interface PortfolioItem {
  id: string;
  coinId: number;
  coin?: CoinData;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  grade?: string;
  notes?: string;
}

export function CoinPortfolioTracker() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const { prices } = useLivePricing();
  
  const { data: coins } = useQuery<CoinData[]>({
    queryKey: ["/api/coins"],
  });

  const [newItem, setNewItem] = useState({
    coinId: "",
    quantity: 1,
    purchasePrice: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    grade: "",
    notes: ""
  });

  const calculateMeltValue = (coin: CoinData) => {
    const weight = parseFloat(coin.weight);
    const purity = parseFloat(coin.purity);
    const metal = coin.type.toLowerCase();
    const price = prices ? (prices[metal as keyof typeof prices] || 0) : 0;
    return weight * purity * price;
  };

  const addToPortfolio = () => {
    const coin = coins?.find(c => c.id.toString() === newItem.coinId);
    if (coin) {
      const item: PortfolioItem = {
        id: Date.now().toString(),
        coinId: parseInt(newItem.coinId),
        coin,
        quantity: newItem.quantity,
        purchasePrice: newItem.purchasePrice,
        purchaseDate: newItem.purchaseDate,
        grade: newItem.grade,
        notes: newItem.notes
      };
      setPortfolio([...portfolio, item]);
      setShowAddDialog(false);
      setNewItem({
        coinId: "",
        quantity: 1,
        purchasePrice: 0,
        purchaseDate: new Date().toISOString().split('T')[0],
        grade: "",
        notes: ""
      });
    }
  };

  const removeFromPortfolio = (id: string) => {
    setPortfolio(portfolio.filter(item => item.id !== id));
  };

  const updatePortfolioItem = (updatedItem: PortfolioItem) => {
    setPortfolio(portfolio.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
    setEditingItem(null);
  };

  const exportPortfolio = () => {
    const data = portfolio.map(item => ({
      Coin: item.coin?.name || '',
      Year: item.coin?.yearStart || '',
      Quantity: item.quantity,
      'Purchase Price': item.purchasePrice,
      'Purchase Date': item.purchaseDate,
      Grade: item.grade || 'N/A',
      'Current Value': item.coin ? calculateMeltValue(item.coin) * item.quantity : 0,
      'Profit/Loss': item.coin ? (calculateMeltValue(item.coin) * item.quantity) - (item.purchasePrice * item.quantity) : 0
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simpleton-portfolio-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const totalValue = portfolio.reduce((sum, item) => 
    sum + (item.coin ? calculateMeltValue(item.coin) * item.quantity : 0), 0
  );

  const totalCost = portfolio.reduce((sum, item) => 
    sum + (item.purchasePrice * item.quantity), 0
  );

  const totalProfit = totalValue - totalCost;
  const profitPercentage = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  // Prepare data for pie chart
  const metalDistribution = portfolio.reduce((acc, item) => {
    if (item.coin) {
      const metal = item.coin.type;
      const value = calculateMeltValue(item.coin) * item.quantity;
      acc[metal] = (acc[metal] || 0) + value;
    }
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(metalDistribution).map(([metal, value]) => ({
    name: metal.charAt(0).toUpperCase() + metal.slice(1),
    value
  }));

  const COLORS = {
    gold: '#FFD700',
    silver: '#C0C0C0',
    platinum: '#E5E4E2',
    palladium: '#CED0DD'
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Wallet className="h-5 w-5 text-yellow-500" />
              <Badge variant="outline">{portfolio.length} coins</Badge>
            </div>
            <p className="text-sm text-yellow-500">Portfolio Value</p>
            <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-yellow-500" />
              <Badge variant="outline">Cost basis</Badge>
            </div>
            <p className="text-sm text-yellow-500">Total Invested</p>
            <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <Badge 
                variant="outline" 
                className={totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}
              >
                {profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(1)}%
              </Badge>
            </div>
            <p className="text-sm text-yellow-500">Total Profit/Loss</p>
            <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-2">
              <Button onClick={() => setShowAddDialog(true)} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Coin
              </Button>
              <Button 
                variant="outline" 
                onClick={exportPortfolio}
                disabled={portfolio.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Distribution Chart */}
      {portfolio.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Portfolio Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || '#8884d8'} 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </RechartsChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-4">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || '#8884d8' }}
                      />
                      <span className="font-medium">{entry.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(entry.value)}</p>
                      <p className="text-sm text-yellow-500">
                        {((entry.value / totalValue) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portfolio Items */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          {portfolio.length > 0 ? (
            <div className="space-y-4">
              {portfolio.map((item) => {
                const currentValue = item.coin ? calculateMeltValue(item.coin) * item.quantity : 0;
                const profit = currentValue - (item.purchasePrice * item.quantity);
                const profitPercent = item.purchasePrice > 0 ? (profit / (item.purchasePrice * item.quantity)) * 100 : 0;
                
                return editingItem?.id === item.id ? (
                  <Card key={item.id} className="p-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          type="number"
                          value={editingItem.quantity}
                          onChange={(e) => setEditingItem({...editingItem, quantity: parseInt(e.target.value) || 0})}
                          placeholder="Quantity"
                        />
                        <Input
                          type="number"
                          value={editingItem.purchasePrice}
                          onChange={(e) => setEditingItem({...editingItem, purchasePrice: parseFloat(e.target.value) || 0})}
                          placeholder="Purchase Price"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => updatePortfolioItem(editingItem)}>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingItem(null)}>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-lg">{item.coin?.name}</h4>
                          {item.grade && (
                            <Badge variant="outline">{item.grade}</Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-yellow-500">Quantity</p>
                            <p className="font-medium">{item.quantity}</p>
                          </div>
                          <div>
                            <p className="text-yellow-500">Purchase Price</p>
                            <p className="font-medium">{formatCurrency(item.purchasePrice)}</p>
                          </div>
                          <div>
                            <p className="text-yellow-500">Current Value</p>
                            <p className="font-medium">{formatCurrency(currentValue)}</p>
                          </div>
                          <div>
                            <p className="text-yellow-500">Profit/Loss</p>
                            <p className={`font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {profit >= 0 ? '+' : ''}{formatCurrency(profit)} ({profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(1)}%)
                            </p>
                          </div>
                        </div>
                        
                        {item.notes && (
                          <p className="text-sm text-yellow-500 mt-2">{item.notes}</p>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditingItem(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeFromPortfolio(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Wallet className="h-16 w-16 mx-auto mb-4 text-yellow-300" />
              <p className="text-xl text-yellow-500 mb-2">Your portfolio is empty</p>
              <p className="text-yellow-400 mb-4">Start tracking your precious metal coins</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Coin
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Coin Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Coin to Portfolio</DialogTitle>
            <DialogDescription>
              Track your precious metal coin investments
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Select value={newItem.coinId} onValueChange={(value) => setNewItem({...newItem, coinId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select a coin..." />
              </SelectTrigger>
              <SelectContent>
                {coins?.map(coin => (
                  <SelectItem key={coin.id} value={coin.id.toString()}>
                    {coin.name} ({coin.yearStart})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Quantity</label>
                <Input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                  min="1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Purchase Price</label>
                <Input
                  type="number"
                  value={newItem.purchasePrice}
                  onChange={(e) => setNewItem({...newItem, purchasePrice: parseFloat(e.target.value) || 0})}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Purchase Date</label>
              <Input
                type="date"
                value={newItem.purchaseDate}
                onChange={(e) => setNewItem({...newItem, purchaseDate: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Grade (Optional)</label>
              <Select value={newItem.grade} onValueChange={(value) => setNewItem({...newItem, grade: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Grade</SelectItem>
                  <SelectItem value="MS-70">MS-70 (Perfect)</SelectItem>
                  <SelectItem value="MS-69">MS-69</SelectItem>
                  <SelectItem value="MS-68">MS-68</SelectItem>
                  <SelectItem value="MS-67">MS-67</SelectItem>
                  <SelectItem value="MS-66">MS-66</SelectItem>
                  <SelectItem value="MS-65">MS-65 (Gem)</SelectItem>
                  <SelectItem value="MS-64">MS-64</SelectItem>
                  <SelectItem value="MS-63">MS-63</SelectItem>
                  <SelectItem value="AU-58">AU-58</SelectItem>
                  <SelectItem value="AU-55">AU-55</SelectItem>
                  <SelectItem value="AU-50">AU-50</SelectItem>
                  <SelectItem value="XF-45">XF-45</SelectItem>
                  <SelectItem value="XF-40">XF-40</SelectItem>
                  <SelectItem value="VF-35">VF-35</SelectItem>
                  <SelectItem value="VF-30">VF-30</SelectItem>
                  <SelectItem value="VF-25">VF-25</SelectItem>
                  <SelectItem value="VF-20">VF-20</SelectItem>
                  <SelectItem value="F-15">F-15</SelectItem>
                  <SelectItem value="F-12">F-12</SelectItem>
                  <SelectItem value="VG-10">VG-10</SelectItem>
                  <SelectItem value="VG-8">VG-8</SelectItem>
                  <SelectItem value="G-6">G-6</SelectItem>
                  <SelectItem value="G-4">G-4</SelectItem>
                  <SelectItem value="AG-3">AG-3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Notes (Optional)</label>
              <Input
                value={newItem.notes}
                onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                placeholder="Any additional notes..."
              />
            </div>
            
            <Button 
              onClick={addToPortfolio} 
              className="w-full"
              disabled={!newItem.coinId || newItem.quantity < 1}
            >
              Add to Portfolio
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}