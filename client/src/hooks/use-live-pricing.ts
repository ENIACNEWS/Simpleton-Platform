import { useQuery } from "@tanstack/react-query";
import { fetchLatestPricing } from "@/lib/pricing-api";
import { LivePrices } from "@/types";

export function useLivePricing() {
  const { data: prices, isLoading, error, dataUpdatedAt } = useQuery<LivePrices>({
    queryKey: ['live-pricing-v3'], // Changed key to force cache refresh
    queryFn: fetchLatestPricing,
    refetchInterval: 30000, // Refresh every 30 seconds for live data
    staleTime: 15000, // Consider data fresh for 15 seconds
    retry: 2, // Retry up to 2 times
    retryDelay: 2000, // Wait 2 seconds before retry
    enabled: true,
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnMount: true, // Always refetch on mount
  });


  return {
    prices,
    isLoading,
    error,
    isError: !!error,
    needsApiKeys: !!error && !prices, // Only show API key message if no data at all
    lastUpdated: dataUpdatedAt,
  };
}
