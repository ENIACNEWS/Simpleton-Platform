import type { Express, Request, Response } from "express";
import { isAuthenticated } from "./auth";

// Simple subscription plans (in-memory for now, can be moved to database later)
const SUBSCRIPTION_PLANS = [
  {
    id: 'starter',
    name: 'Starter Plan',
    description: 'Perfect for small businesses and individual developers',
    price: '49.00',
    features: [
      'Access to Precious Metals Aggregation API',
      'Basic AI Intelligence (3 providers)',
      '10,000 API requests/month',
      'Email support',
      'Basic documentation'
    ],
    apiAccess: ['precious-metals', 'ai-intelligence'],
    requestsPerMonth: 10000,
    support: 'Email'
  },
  {
    id: 'professional',
    name: 'Professional Plan',
    description: 'For growing businesses needing comprehensive data access',
    price: '149.00',
    features: [
      'Full Precious Metals Aggregation API (50+ sources)',
      'Complete AI Intelligence (5 providers)',
      'Revolutionary Diamond Aggregation API',
      '100,000 API requests/month',
      'Priority support',
      'Advanced analytics dashboard',
      'Custom integrations'
    ],
    apiAccess: ['precious-metals', 'ai-intelligence', 'diamonds'],
    requestsPerMonth: 100000,
    support: 'Priority'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    description: 'For large organizations requiring unlimited access',
    price: '499.00',
    features: [
      'Unlimited access to all Aggregation APIs',
      'White-label solutions',
      'Custom AI model training',
      'Unlimited API requests',
      'Dedicated account manager',
      '24/7 phone support',
      'SLA guarantees',
      'Custom development'
    ],
    apiAccess: ['precious-metals', 'ai-intelligence', 'diamonds'],
    requestsPerMonth: -1, // Unlimited
    support: 'Dedicated'
  }
];

// Simple in-memory storage for subscriptions (can be moved to database later)
const userSubscriptions = new Map<number, {
  userId: number;
  planId: string;
  status: string;
  startDate: Date;
  endDate: Date;
  requestsUsed: number;
}>();

export function setupSubscriptionSystem(app: Express) {
  
  // Get all subscription plans (public)
  app.get('/api/subscriptions/plans', (req: Request, res: Response) => {
    res.json(SUBSCRIPTION_PLANS);
  });

  // Get user's current subscription (authenticated)
  app.get('/api/subscriptions/current', isAuthenticated, (req: any, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const subscription = userSubscriptions.get(userId);
      res.json(subscription || null);
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      res.status(500).json({ error: 'Failed to fetch subscription' });
    }
  });

  // Create new subscription (authenticated)
  app.post('/api/subscriptions/subscribe', isAuthenticated, (req: any, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { planId } = req.body;
      if (!planId) {
        return res.status(400).json({ error: 'Plan ID is required' });
      }

      // Check if plan exists
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) {
        return res.status(400).json({ error: 'Invalid plan ID' });
      }

      // Check if user already has an active subscription
      const existingSubscription = userSubscriptions.get(userId);
      if (existingSubscription && existingSubscription.status === 'active') {
        return res.status(400).json({ error: 'User already has an active subscription' });
      }

      // Create subscription
      const subscription = {
        userId,
        planId,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        requestsUsed: 0
      };

      userSubscriptions.set(userId, subscription);
      res.json(subscription);
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ error: 'Failed to create subscription' });
    }
  });

  // Get usage statistics (authenticated)
  app.get('/api/subscriptions/usage', isAuthenticated, (req: any, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const subscription = userSubscriptions.get(userId);
      if (!subscription) {
        return res.json({
          totalRequests: 0,
          requestsThisMonth: 0,
          requestsRemaining: 0,
          apiBreakdown: {}
        });
      }

      const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.planId);
      const requestsRemaining = plan && plan.requestsPerMonth > 0 
        ? Math.max(0, plan.requestsPerMonth - subscription.requestsUsed)
        : -1; // Unlimited

      res.json({
        totalRequests: subscription.requestsUsed,
        requestsThisMonth: subscription.requestsUsed,
        requestsRemaining,

      });
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      res.status(500).json({ error: 'Failed to fetch usage statistics' });
    }
  });

  // Cancel subscription (authenticated)
  app.post('/api/subscriptions/cancel', isAuthenticated, (req: any, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const subscription = userSubscriptions.get(userId);
      if (subscription) {
        subscription.status = 'cancelled';
        userSubscriptions.set(userId, subscription);
      }

      res.json({ message: 'Subscription cancelled successfully' });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  });

  // Helper function to check API access
  function checkApiAccess(userId: number, apiType: string): boolean {
    const subscription = userSubscriptions.get(userId);
    if (!subscription || subscription.status !== 'active') {
      return false;
    }

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.planId);
    return plan ? plan.apiAccess.includes(apiType) : false;
  }

  // Helper function to log API usage
  function logApiUsage(userId: number): void {
    const subscription = userSubscriptions.get(userId);
    if (subscription) {
      subscription.requestsUsed++;
      userSubscriptions.set(userId, subscription);
    }
  }

  // Export helper functions for use in other modules
  (app as any).checkApiAccess = checkApiAccess;
  (app as any).logApiUsage = logApiUsage;
}