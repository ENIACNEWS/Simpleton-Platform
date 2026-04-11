import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import cors from "cors";
import helmet from "helmet";
import { setupSession, setupPassport } from "./auth";
import { s7m } from "./s7-core";
import { authenticateAPIKey, rateLimitAPIKey, logAPIUsage } from "./api-auth";
import { apiRateLimiter } from "./rate-limiter";
import { setupSubscriptionSystem } from "./simple-subscription-system";
import quantumTrilogyRoutes from "./routes/quantum-trilogy-routes";

import { registerAssistantRoutes } from "./routes/assistant";
import { registerAppraisalRoutes } from "./routes/appraisal";
import { registerAuthRoutes } from "./routes/auth";
import { registerPortfolioRoutes } from "./routes/portfolio";
import { registerAdminRoutes } from "./routes/admin";
import { registerPricingRoutes } from "./routes/pricing";
import { registerMarketRoutes } from "./routes/market";
import { registerDiamondRoutes } from "./routes/diamonds";
import { registerWatchRoutes } from "./routes/watches";
import { registerGmailRoutes } from "./routes/gmail";
import { registerSimpletonListRoutes } from "./routes/simpletons-list";
import { registerAIServiceRoutes } from "./routes/ai-services";
import { registerIntelligenceRoutes } from "./routes/intelligence";
import { registerPlatformRoutes } from "./routes/platform";
import { registerCryptoRoutes } from "./routes/crypto";
import { startMarketIntelligence } from "./market-intelligence";
import { registerAgentRoutes } from "./routes/agents";
import seoRoutes from "./routes/seo";

export async function registerRoutes(app: Express): Promise<Server> {
  // Security headers — helmet sets X-Content-Type-Options, X-Frame-Options,
  // Strict-Transport-Security, and other headers that protect against common attacks.
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled so Vite/React inline scripts work; tighten in production
    crossOriginEmbedderPolicy: false,
  }));

  // Cache control: index.html must never be cached so users always get the latest version after publish.
  // Static assets (/assets/*.js, /assets/*.css) get long-term caching — Vite gives them unique content-hash filenames.
  app.use((req, res, next) => {
    const isAsset = req.path.match(/\.(js|css|woff2?|ttf|eot|png|jpg|jpeg|gif|svg|ico|webp|map)$/);
    if (isAsset) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    next();
  });

  // Body parsing middleware — 5MB default for general API, image uploads handled separately
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // Larger body limit ONLY for appraisal image upload endpoints
  app.use('/api/appraisal', express.json({ limit: '25mb' }));
  app.use('/api/assistant/appraise', express.json({ limit: '25mb' }));

  // CORS configuration - Enable credentials for authentication routes (locked to own domain)
  // Always include Railway domain and localhost alongside any custom origins
  const envOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
  const defaultOrigins = ['https://simpletonapp.com', 'https://simpleton-platform-production.up.railway.app', 'http://localhost:5000'];
  const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

  app.use('/api/auth', cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
  }));

  // CORS configuration for external API access (without credentials)
  app.use('/api', cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      callback(null, true);
    },
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Comprehensive rate limiting (protects all API endpoints except feedback, assistant, simpleton vision, and hidden gems quantum data)
  app.use((req, res, next) => {
    if (req.path === '/api/feedback/submit' || req.path === '/api/assistant/help' || req.path === '/api/assistant/appraise' || req.path === '/api/assistant/session' || req.path === '/api/assistant/speak' || req.path === '/api/simpleton-vision/chat' || req.path === '/api/simplicity/feedback' || req.path === '/api/simplicity/knowledge-stats' || req.path.startsWith('/api/hidden-gems/') || req.path.startsWith('/api/rolex-ai/') || req.path === '/api/chat/history') {
      return next();
    }
    return apiRateLimiter(req, res, next);
  });

  setupSession(app);
  setupPassport(app);

  app.use(s7m);

  // --- SEO ROUTES (public, no auth required) ---
  app.use("/api/seo", seoRoutes);

  // --- PRE-AUTH ROUTES (assistant, appraisal, intelligence must come before API auth middleware) ---
  registerCryptoRoutes(app);

  // Start the 10-minute market intelligence training loop
  startMarketIntelligence();
  registerAssistantRoutes(app);
  registerAppraisalRoutes(app);
  registerIntelligenceRoutes(app);

  // External API authentication and rate limiting middleware (skip hidden gems quantum data and auth routes)
  app.use('/api', (req, res, next) => {
    if (req.path.startsWith('/api/hidden-gems/') || req.path.startsWith('/api/auth/') || req.path.startsWith('/api/rolex-ai/')) {
      return next();
    }
    return authenticateAPIKey(req, res, next);
  });
  app.use('/api', (req, res, next) => {
    if (req.path.startsWith('/api/hidden-gems/') || req.path.startsWith('/api/auth/') || req.path.startsWith('/api/rolex-ai/')) {
      return next();
    }
    return rateLimitAPIKey(req, res, next);
  });
  app.use('/api', logAPIUsage);

  // --- POST-AUTH ROUTES ---
  registerAuthRoutes(app);
  registerPortfolioRoutes(app);
  await registerAdminRoutes(app);
  registerPricingRoutes(app);
  registerMarketRoutes(app);
  registerDiamondRoutes(app);
  registerWatchRoutes(app);
  registerGmailRoutes(app);
  registerAIServiceRoutes(app);
  registerPlatformRoutes(app);

  // Quantum management routes
  const {
    handleQuantumStatus,
    handleGenerateConnector,
    handleDeployConnector,
    handleGenerateStateAPIs,
    handleListConnectors,
    handleGenerateAllStates
  } = await import('./routes/quantum-management');

  app.get("/api/quantum/status", handleQuantumStatus);
  app.post("/api/quantum/generate-connector", handleGenerateConnector);
  app.post("/api/quantum/deploy-connector", handleDeployConnector);
  app.post("/api/quantum/generate-state-apis", handleGenerateStateAPIs);
  app.get("/api/quantum/list-connectors", handleListConnectors);
  app.post("/api/quantum/generate-all-states", handleGenerateAllStates);

  // Quantum Trilogy routes
  app.use('/api/quantum', quantumTrilogyRoutes);

  // Setup Subscription System
  setupSubscriptionSystem(app);

  // AI Secretary Features have been retired

  // Log all access attempts (hidden monitoring)
  const { logAllAccess } = await import('./admin-security');
  app.use(logAllAccess);

  // Simpletons List routes (must come after auth middleware)
  registerSimpletonListRoutes(app);

  // Autonomous Agent System routes
  registerAgentRoutes(app);

  // Global error handler — catches unhandled errors and returns clean responses.
  // NEVER leak stack traces or internal details to the client.
  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error('[UNHANDLED ERROR]', err?.message || err);
    if (process.env.NODE_ENV !== 'production') {
      console.error(err?.stack);
    }
    res.status(err?.status || 500).json({
      error: process.env.NODE_ENV === 'production'
        ? 'An internal error occurred'
        : err?.message || 'An internal error occurred'
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
