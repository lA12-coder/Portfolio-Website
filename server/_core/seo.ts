import type { Express, Request } from "express";
import { ENV } from "./env";

function getSiteOrigin(req: Request) {
  if (ENV.siteUrl) return ENV.siteUrl.replace(/\/$/, "");

  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol = Array.isArray(forwardedProto)
    ? forwardedProto[0]
    : forwardedProto || req.protocol;
  return `${protocol}://${req.get("host")}`;
}

export function registerSeoRoutes(app: Express) {
  app.get("/robots.txt", (req, res) => {
    const origin = getSiteOrigin(req);

    res.type("text/plain").send([
      "User-agent: *",
      "Allow: /",
      "",
      `Sitemap: ${origin}/sitemap.xml`,
      "",
    ].join("\n"));
  });

  app.get("/sitemap.xml", (req, res) => {
    const origin = getSiteOrigin(req);
    const now = new Date().toISOString();
    const routes = ["/", "/blog"];

    res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map((route) => `  <url>
    <loc>${origin}${route}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${route === "/" ? "weekly" : "monthly"}</changefreq>
    <priority>${route === "/" ? "1.0" : "0.8"}</priority>
  </url>`)
  .join("\n")}
</urlset>`);
  });
}
