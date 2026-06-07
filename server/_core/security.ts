import type { Express, Request, Response, NextFunction } from "express";
import { ENV } from "./env";

function analyticsOrigin() {
  const endpoint = process.env.VITE_ANALYTICS_ENDPOINT;
  if (!endpoint) return "";

  try {
    return new URL(endpoint).origin;
  } catch {
    return "";
  }
}

export function registerSecurityHeaders(app: Express) {
  app.set("trust proxy", 1);

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(self), interest-cohort=()");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");

    if (ENV.isProduction) {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

      const analytics = analyticsOrigin();
      const scriptSrc = ["'self'", analytics].filter(Boolean).join(" ");
      res.setHeader(
        "Content-Security-Policy",
        [
          "default-src 'self'",
          `script-src ${scriptSrc}`,
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data:",
          "connect-src 'self'",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "object-src 'none'",
          "upgrade-insecure-requests",
        ].join("; ")
      );
    }

    next();
  });
}
