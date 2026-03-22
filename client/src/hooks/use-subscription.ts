import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

export interface SubscriptionFeatures {
  hasUnlimitedCalculations: boolean;
  hasRapaportAccess: boolean;
  hasPdfExport: boolean;
  hasBatchProcessing: boolean;
  hasCustomSettings: boolean;
  hasPrioritySupport: boolean;
  calculationsLimit: number;
  calculationsUsed: number;
  planName: string;
  planId: string;
}

export function useSubscription() {
  const { user, isAuthenticated } = useAuth();

  const { data: subscription, isLoading, error } = useQuery({
    queryKey: ['/api/subscription/status'],
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // refetch every 5 minutes
  });

  // Default to free tier if no subscription or not authenticated
  const features: SubscriptionFeatures = subscription?.features || {
    hasUnlimitedCalculations: false,
    hasRapaportAccess: false,
    hasPdfExport: false,
    hasBatchProcessing: false,
    hasCustomSettings: false,
    hasPrioritySupport: false,
    calculationsLimit: 25,
    calculationsUsed: 0,
    planName: "Free",
    planId: "free"
  };

  const canUseCalculator = () => {
    if (!isAuthenticated) return false;
    if (features.hasUnlimitedCalculations) return true;
    return features.calculationsUsed < features.calculationsLimit;
  };

  const getRemainingCalculations = () => {
    if (features.hasUnlimitedCalculations) return "Unlimited";
    return Math.max(0, features.calculationsLimit - features.calculationsUsed);
  };

  const canAccessRapaport = () => {
    return features.hasRapaportAccess;
  };

  const canExportPdf = () => {
    return features.hasPdfExport;
  };

  const canUseBatchProcessing = () => {
    return features.hasBatchProcessing;
  };

  const canUseCustomSettings = () => {
    return features.hasCustomSettings;
  };

  const getUpgradeMessage = (feature: string) => {
    if (features.planId === "free") {
      return `Upgrade to Pro ($9.99/month) to access ${feature}`;
    }
    return "";
  };

  return {
    subscription,
    features,
    isLoading,
    error,
    canUseCalculator,
    getRemainingCalculations,
    canAccessRapaport,
    canExportPdf,
    canUseBatchProcessing,
    canUseCustomSettings,
    getUpgradeMessage,
    isAuthenticated
  };
}