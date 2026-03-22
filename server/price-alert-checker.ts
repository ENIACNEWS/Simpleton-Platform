import { storage } from './storage';
import { getKitcoPricing } from './kitco-pricing';

let checkInterval: ReturnType<typeof setInterval> | null = null;

async function checkAlerts(): Promise<void> {
  try {
    const activeAlerts = await storage.getActivePriceAlerts();
    if (activeAlerts.length === 0) return;

    const prices = await getKitcoPricing();
    if (!prices) return;

    const priceMap: Record<string, number> = {
      gold: prices.gold || 0,
      silver: prices.silver || 0,
      platinum: prices.platinum || 0,
      palladium: prices.palladium || 0,
    };

    for (const alert of activeAlerts) {
      const currentPrice = priceMap[alert.assetType];
      if (!currentPrice) continue;

      const target = parseFloat(alert.targetPrice);
      const triggered =
        (alert.direction === 'above' && currentPrice >= target) ||
        (alert.direction === 'below' && currentPrice <= target);

      if (triggered) {
        await storage.updatePriceAlert(alert.id, {
          status: 'triggered',
          triggeredAt: new Date(),
          triggeredPrice: currentPrice.toString(),
        });
        console.log(`🔔 PRICE ALERT TRIGGERED: ${alert.assetName} ${alert.direction} $${target} (current: $${currentPrice.toFixed(2)})`);
      }
    }
  } catch (err) {
    console.error('Price alert check error:', err);
  }
}

export function startPriceAlertChecker(): void {
  if (checkInterval) return;
  checkInterval = setInterval(checkAlerts, 5 * 60 * 1000);
  setTimeout(checkAlerts, 30000);
  console.log('🔔 Price Alert Checker: Monitoring every 5 minutes');
}

export function stopPriceAlertChecker(): void {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}
