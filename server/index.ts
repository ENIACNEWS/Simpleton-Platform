import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { ensureTablesExist } from "./db";
import { simplicityBodySystem } from "./simplicity-body-system";
import { simplicitySelfAwareness } from "./simplicity-self-awareness";
import { healthMonitor, registerHealthRoutes } from "./health-monitor";
import { backgroundLearner, startBackgroundLearning, stopBackgroundLearning } from "./simplicity-background-learner";
import { agentScheduler } from "./agents";

const app = express();
// Increase payload limits for image uploads in Simpleton Vision™
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Ensure database tables exist on startup
  await ensureTablesExist();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use PORT env var (required by Railway/cloud hosts) with fallback to 5000 for local dev
  const port = parseInt(process.env.PORT || "5000", 10);
  // reusePort is unsupported on macOS (ENOTSUP) — only enable on Linux/Railway.
  const listenOpts: { port: number; host: string; reusePort?: boolean } = {
    port,
    host: "0.0.0.0",
  };
  if (process.platform === "linux") {
    listenOpts.reusePort = true;
  }
  server.listen(listenOpts, () => {
    log(`serving on port ${port}`);

    // Register health monitoring routes
    registerHealthRoutes(app);

    // Start health monitoring immediately
    healthMonitor.start();
    log('Health Monitor started');

    // Start background systems after 30s to let the server stabilize
    setTimeout(() => {
      try {
        simplicityBodySystem.start();
    simplicitySelfAwareness.start();
        log('Simplicity Body System initialized');
      } catch (err) {
        console.error('Body System startup error (non-blocking):', err);
      }
    }, 30000);

    // Start Simplicity's background learning after 60s
    setTimeout(async () => {
      try {
        await startBackgroundLearning();
        log('Simplicity Background Learner started — she is now studying');
      } catch (err) {
        console.error('Background Learner startup error (non-blocking):', err);
      }
    }, 60000);

    // Start Autonomous Agent System after 90s
    setTimeout(async () => {
      try {
        await agentScheduler.start();
        log('Agent System online — 8 agents standing by');
      } catch (err) {
        console.error('Agent Scheduler startup error (non-blocking):', err);
      }
    }, 90000);
  });

  // Graceful shutdown
  const shutdown = async () => {
    log('Shutting down gracefully...');
    healthMonitor.stop();
    agentScheduler.stop();
    await stopBackgroundLearning();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
})();
