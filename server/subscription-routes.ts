import type { Express, Request, Response } from "express";
import { subscriptionService } from "./subscription-service";
import { isAuthenticated } from "./auth";

export function registerSubscriptionRoutes(app: Express) {
  
  // Initialize subscription plans on startup
  subscriptionService.initializePlans().catch(console.error);

  // Get all subscription plans (public)
  app.get('/api/subscriptions/plans', async (req: Request, res: Response) => {
    try {
      const plans = await subscriptionService.getPlans();
      res.json(plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      res.status(500).json({ error: 'Failed to fetch subscription plans' });
    }
  });

  // Get user's current subscription (authenticated)
  app.get('/api/subscriptions/current', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const subscription = await subscriptionService.getUserSubscription(req.user.id);
      res.json(subscription);
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      res.status(500).json({ error: 'Failed to fetch subscription' });
    }
  });

  // Create new subscription (authenticated)
  app.post('/api/subscriptions/subscribe', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { planId } = req.body;
      if (!planId) {
        return res.status(400).json({ error: 'Plan ID is required' });
      }

      // Check if user already has an active subscription
      const existingSubscription = await subscriptionService.getUserSubscription(req.user.id);
      if (existingSubscription) {
        return res.status(400).json({ error: 'User already has an active subscription' });
      }

      const subscription = await subscriptionService.createSubscription(req.user.id, planId);
      res.json(subscription);
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ error: 'Failed to create subscription' });
    }
  });

  // Get usage statistics (authenticated)
  app.get('/api/subscriptions/usage', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const stats = await subscriptionService.getUsageStats(req.user.id);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      res.status(500).json({ error: 'Failed to fetch usage statistics' });
    }
  });

  // Cancel subscription (authenticated)
  app.post('/api/subscriptions/cancel', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      await subscriptionService.cancelSubscription(req.user.id);
      res.json({ message: 'Subscription cancelled successfully' });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  });

  // Middleware to check API access permissions
  app.use('/api/(precious-metals|ai|diamonds)/*', isAuthenticated, async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Authentication required for API access' });
      }

      // Determine API type from URL
      let apiType = '';
      if (req.path.includes('/api/precious-metals') || req.path.includes('/api/pricing') || req.path.includes('/api/data-collection')) {
        apiType = 'precious-metals';
      } else if (req.path.includes('/api/ai')) {
        apiType = 'ai-intelligence';
      } else if (req.path.includes('/api/diamonds')) {
        apiType = 'diamonds';
      }

      if (!apiType) {
        return res.status(400).json({ error: 'Invalid API endpoint' });
      }

      // Check if user has access to this API
      const hasAccess = await subscriptionService.checkApiAccess(req.user.id, apiType);
      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Subscription required',
          message: `Access to ${apiType} API requires an active subscription`,
          upgradeUrl: '/api-subscriptions'
        });
      }

      // Log API usage
      const startTime = Date.now();
      const originalSend = res.send;
      res.send = function(data) {
        const responseTime = Date.now() - startTime;
        subscriptionService.logApiUsage(
          req.user!.id,
          apiType,
          req.path,
          responseTime,
          res.statusCode < 400
        ).catch(console.error);
        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Error checking API access:', error);
      res.status(500).json({ error: 'Failed to verify API access' });
    }
  });
}