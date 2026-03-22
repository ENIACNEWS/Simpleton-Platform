import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Settings, TrendingUp, TrendingDown, AlertTriangle, Clock, BarChart3, History, Target } from "lucide-react";

interface PortfolioAllocation {
  goldValue: number;
  silverValue: number;
  platinumValue: number;
  totalValue: number;
  goldPercentage: number;
  silverPercentage: number;
  platinumPercentage: number;
}

interface RebalanceRecommendation {
  action: "buy" | "sell";
  metalType: "gold" | "silver" | "platinum";
  amount: number;
  value: number;
  reason: string;
}

interface RebalanceAnalysis {
  currentAllocation: PortfolioAllocation;
  targetAllocation: PortfolioAllocation;
  needsRebalancing: boolean;
  triggerReason?: string;
  recommendations: RebalanceRecommendation[];
  estimatedCosts: number;
}

interface PortfolioRebalancingProps {
  portfolioId: number;
  portfolio: any;
}

export function PortfolioRebalancing({ portfolioId, portfolio }: PortfolioRebalancingProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [rebalanceConfig, setRebalanceConfig] = useState({
    autoRebalanceEnabled: portfolio?.autoRebalanceEnabled || false,
    rebalanceFrequency: portfolio?.rebalanceFrequency || "monthly",
    thresholdPercentage: parseFloat(portfolio?.thresholdPercentage || "5"),
    targetGoldPercentage: parseFloat(portfolio?.targetGoldPercentage || "60"),
    targetSilverPercentage: parseFloat(portfolio?.targetSilverPercentage || "30"),
    targetPlatinumPercentage: parseFloat(portfolio?.targetPlatinumPercentage || "10"),
  });

  // Get rebalancing analysis
  const { data: analysis, isLoading: analysisLoading } = useQuery<RebalanceAnalysis>({
    queryKey: ["/api/portfolios", portfolioId, "rebalance", "analysis"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get rebalancing history
  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["/api/portfolios", portfolioId, "rebalance", "history"],
  });

  // Update configuration
  const updateConfigMutation = useMutation({
    mutationFn: async (config: any) => {
      return apiRequest(`/api/portfolios/${portfolioId}/rebalance/config`, {
        method: "PATCH",
        body: JSON.stringify(config),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({
        title: "Configuration Updated",
        description: "Rebalancing settings have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios", portfolioId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update rebalancing configuration.",
        variant: "destructive",
      });
    },
  });

  // Execute rebalancing
  const executeRebalanceMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/portfolios/${portfolioId}/rebalance/execute`, {
        method: "POST",
        body: JSON.stringify({ triggerReason: "manual" }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({
        title: "Rebalancing Executed",
        description: "Portfolio rebalancing has been successfully executed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios", portfolioId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to execute rebalancing.",
        variant: "destructive",
      });
    },
  });

  const handleSaveConfig = () => {
    // Validate percentages add up to 100
    const total = rebalanceConfig.targetGoldPercentage + 
                 rebalanceConfig.targetSilverPercentage + 
                 rebalanceConfig.targetPlatinumPercentage;
    
    if (Math.abs(total - 100) > 0.1) {
      toast({
        title: "Invalid Allocation",
        description: "Target percentages must add up to 100%.",
        variant: "destructive",
      });
      return;
    }

    updateConfigMutation.mutate(rebalanceConfig);
  };

  const getAllocationColor = (percentage: number, target: number, threshold: number) => {
    const drift = Math.abs(percentage - target);
    if (drift > threshold) return "text-red-500";
    if (drift > threshold * 0.5) return "text-yellow-500";
    return "text-green-500";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatWeight = (grams: number) => {
    return `${grams.toFixed(2)}g`;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-yellow-900 dark:text-white">Automated Rebalancing</h2>
          <p className="text-yellow-700 dark:text-gray-300">
            Maintain optimal portfolio allocation with sophisticated algorithms
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {analysis?.needsRebalancing && (
            <Badge variant="destructive" className="animate-pulse">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Rebalancing Needed
            </Badge>
          )}
          {rebalanceConfig.autoRebalanceEnabled && (
            <Badge variant="secondary">
              <Target className="h-3 w-3 mr-1" />
              Auto-Enabled
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current vs Target Allocation */}
        <Card className="border-yellow-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-900 dark:text-white">
              <BarChart3 className="h-5 w-5" />
              <span>Portfolio Allocation</span>
            </CardTitle>
            <CardDescription>Current allocation vs target percentages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysisLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ) : analysis ? (
              <div className="space-y-4">
                {/* Gold Allocation */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-yellow-900 dark:text-white">Gold</span>
                    <span className={`text-sm font-bold ${getAllocationColor(
                      analysis.currentAllocation.goldPercentage,
                      analysis.targetAllocation.goldPercentage,
                      rebalanceConfig.thresholdPercentage
                    )}`}>
                      {analysis.currentAllocation.goldPercentage.toFixed(1)}% / {analysis.targetAllocation.goldPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={analysis.currentAllocation.goldPercentage} className="h-2" />
                  <div className="text-xs text-yellow-600 dark:text-gray-400">
                    Value: {formatCurrency(analysis.currentAllocation.goldValue)}
                  </div>
                </div>

                {/* Silver Allocation */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-yellow-900 dark:text-white">Silver</span>
                    <span className={`text-sm font-bold ${getAllocationColor(
                      analysis.currentAllocation.silverPercentage,
                      analysis.targetAllocation.silverPercentage,
                      rebalanceConfig.thresholdPercentage
                    )}`}>
                      {analysis.currentAllocation.silverPercentage.toFixed(1)}% / {analysis.targetAllocation.silverPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={analysis.currentAllocation.silverPercentage} className="h-2" />
                  <div className="text-xs text-yellow-600 dark:text-gray-400">
                    Value: {formatCurrency(analysis.currentAllocation.silverValue)}
                  </div>
                </div>

                {/* Platinum Allocation */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-yellow-900 dark:text-white">Platinum</span>
                    <span className={`text-sm font-bold ${getAllocationColor(
                      analysis.currentAllocation.platinumPercentage,
                      analysis.targetAllocation.platinumPercentage,
                      rebalanceConfig.thresholdPercentage
                    )}`}>
                      {analysis.currentAllocation.platinumPercentage.toFixed(1)}% / {analysis.targetAllocation.platinumPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={analysis.currentAllocation.platinumPercentage} className="h-2" />
                  <div className="text-xs text-yellow-600 dark:text-gray-400">
                    Value: {formatCurrency(analysis.currentAllocation.platinumValue)}
                  </div>
                </div>

                <Separator />

                <div className="text-sm text-yellow-900 dark:text-white">
                  <strong>Total Portfolio Value: {formatCurrency(analysis.currentAllocation.totalValue)}</strong>
                </div>
              </div>
            ) : (
              <div className="text-center text-yellow-600 dark:text-gray-400 py-4">
                No allocation data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rebalancing Recommendations */}
        <Card className="border-yellow-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-900 dark:text-white">
              <TrendingUp className="h-5 w-5" />
              <span>Rebalancing Recommendations</span>
            </CardTitle>
            <CardDescription>
              {analysis?.needsRebalancing ? analysis.triggerReason : "Portfolio is well balanced"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysisLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ) : analysis?.needsRebalancing && analysis.recommendations.length > 0 ? (
              <div className="space-y-4">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="p-3 bg-yellow-50 dark:bg-gray-800 rounded-lg border border-yellow-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {rec.action === "buy" ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium capitalize text-yellow-900 dark:text-white">
                          {rec.action} {rec.metalType}
                        </span>
                      </div>
                      <Badge variant={rec.action === "buy" ? "default" : "secondary"}>
                        {formatCurrency(rec.value)}
                      </Badge>
                    </div>
                    <div className="text-sm text-yellow-600 dark:text-gray-400 mb-1">
                      Amount: {formatWeight(rec.amount)}
                    </div>
                    <div className="text-xs text-yellow-500 dark:text-gray-500">
                      {rec.reason}
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-yellow-600 dark:text-gray-400">
                    Estimated Transaction Costs:
                  </span>
                  <span className="font-medium text-yellow-900 dark:text-white">
                    {formatCurrency(analysis.estimatedCosts)}
                  </span>
                </div>

                <Button 
                  onClick={() => executeRebalanceMutation.mutate()}
                  disabled={executeRebalanceMutation.isPending}
                  className="w-full"
                >
                  {executeRebalanceMutation.isPending ? "Executing..." : "Execute Rebalancing"}
                </Button>
              </div>
            ) : (
              <div className="text-center text-green-600 dark:text-green-400 py-4">
                <Target className="h-8 w-8 mx-auto mb-2" />
                <p className="font-medium">Portfolio is optimally balanced</p>
                <p className="text-sm text-yellow-600 dark:text-gray-400">
                  No rebalancing needed at this time
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Configuration Dialog */}
      <Card className="border-yellow-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-yellow-900 dark:text-white">
            <Settings className="h-5 w-5" />
            <span>Rebalancing Configuration</span>
          </CardTitle>
          <CardDescription>Set your target allocation and automation preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto-Rebalancing Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auto-rebalance" className="text-yellow-900 dark:text-white">
                Enable Auto-Rebalancing
              </Label>
              <p className="text-sm text-yellow-600 dark:text-gray-400">
                Automatically monitor and suggest rebalancing when needed
              </p>
            </div>
            <Switch
              id="auto-rebalance"
              checked={rebalanceConfig.autoRebalanceEnabled}
              onCheckedChange={(checked) =>
                setRebalanceConfig({ ...rebalanceConfig, autoRebalanceEnabled: checked })
              }
            />
          </div>

          {rebalanceConfig.autoRebalanceEnabled && (
            <>
              <Separator />
              
              {/* Rebalancing Frequency */}
              <div className="space-y-2">
                <Label className="text-yellow-900 dark:text-white">Rebalancing Frequency</Label>
                <Select
                  value={rebalanceConfig.rebalanceFrequency}
                  onValueChange={(value) =>
                    setRebalanceConfig({ ...rebalanceConfig, rebalanceFrequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Threshold Percentage */}
              <div className="space-y-2">
                <Label className="text-yellow-900 dark:text-white">
                  Drift Threshold ({rebalanceConfig.thresholdPercentage}%)
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  step="0.5"
                  value={rebalanceConfig.thresholdPercentage}
                  onChange={(e) =>
                    setRebalanceConfig({
                      ...rebalanceConfig,
                      thresholdPercentage: parseFloat(e.target.value) || 5,
                    })
                  }
                />
                <p className="text-xs text-yellow-600 dark:text-gray-400">
                  Trigger rebalancing when allocation drifts beyond this percentage
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* Target Allocations */}
          <div className="space-y-4">
            <Label className="text-yellow-900 dark:text-white text-base font-medium">
              Target Allocation Percentages
            </Label>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-yellow-900 dark:text-white">Gold (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={rebalanceConfig.targetGoldPercentage}
                  onChange={(e) =>
                    setRebalanceConfig({
                      ...rebalanceConfig,
                      targetGoldPercentage: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-yellow-900 dark:text-white">Silver (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={rebalanceConfig.targetSilverPercentage}
                  onChange={(e) =>
                    setRebalanceConfig({
                      ...rebalanceConfig,
                      targetSilverPercentage: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-yellow-900 dark:text-white">Platinum (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={rebalanceConfig.targetPlatinumPercentage}
                  onChange={(e) =>
                    setRebalanceConfig({
                      ...rebalanceConfig,
                      targetPlatinumPercentage: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            
            <div className="text-center">
              <span className="text-sm text-yellow-600 dark:text-gray-400">
                Total: {(
                  rebalanceConfig.targetGoldPercentage +
                  rebalanceConfig.targetSilverPercentage +
                  rebalanceConfig.targetPlatinumPercentage
                ).toFixed(1)}%
              </span>
            </div>
          </div>

          <Button 
            onClick={handleSaveConfig}
            disabled={updateConfigMutation.isPending}
            className="w-full"
          >
            {updateConfigMutation.isPending ? "Saving..." : "Save Configuration"}
          </Button>
        </CardContent>
      </Card>

      {/* Rebalancing History */}
      <Card className="border-yellow-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-yellow-900 dark:text-white">
            <History className="h-5 w-5" />
            <span>Rebalancing History</span>
          </CardTitle>
          <CardDescription>Recent rebalancing activities and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ) : history && history.length > 0 ? (
            <div className="space-y-4">
              {history.slice(0, 5).map((record: any) => (
                <div key={record.id} className="p-4 bg-yellow-50 dark:bg-gray-800 rounded-lg border border-yellow-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-900 dark:text-white">
                        {new Date(record.rebalanceDate).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge variant={record.status === "executed" ? "default" : "secondary"}>
                      {record.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-yellow-600 dark:text-gray-400 mb-2">
                    Trigger: {record.triggerReason}
                  </div>
                  <div className="text-xs text-yellow-500 dark:text-gray-500">
                    Portfolio Value: {formatCurrency(parseFloat(record.beforeTotalValue))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-yellow-600 dark:text-gray-400 py-4">
              <History className="h-8 w-8 mx-auto mb-2" />
              <p>No rebalancing history available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}