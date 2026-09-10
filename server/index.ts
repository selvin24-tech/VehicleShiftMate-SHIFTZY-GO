import "dotenv/config";

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createSessionMiddleware, configurePassport } from "./auth";

const app = express();
// Keep the raw request body around so gateway webhooks (Cashfree) can be
// signature-verified against the exact bytes that were signed.
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as unknown as { rawBody?: Buffer }).rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: false }));

const passport = configurePassport();
// Behind a TLS-terminating proxy (e.g. Render) the app receives plain HTTP with
// X-Forwarded-Proto: https. Trust the first proxy hop so express-session will
// issue the `secure` login cookie in production.
app.set("trust proxy", 1);
app.use(createSessionMiddleware());
app.use(passport.initialize());
app.use(passport.session());

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
  const server = await registerRoutes(app);

  app.use(
    (err: any, _req: Request, res: Response, next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      // If the response has already started, hand off to Express' default handler.
      if (res.headersSent) {
        return next(err);
      }

      res.status(status).json({ message });
      // Log for diagnostics. Do NOT re-throw here — throwing after the response
      // has been sent crashes the process on an otherwise-handled error.
      console.error(err);
    }
  );

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Serve both the API and the client on one port. Hosts like Render inject the
  // port to bind via process.env.PORT; fall back to 5000 for local dev.
  const port = Number(process.env.PORT) || 5000;

  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
