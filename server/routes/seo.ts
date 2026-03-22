/**
 * SEO Routes — Simpleton™
 * Serves dynamic sitemap, robots.txt fallback, and structured data endpoints
 * LaDale Industries LLC
 */

import { Router, type Request, type Response } from "express";

const router = Router();

// All publicly crawlable routes in the SPA
const PUBLIC_ROUTES = [
  { path: "/", changefreq: "daily", priority: 1.0 },
  { path: "/pricing", changefreq: "daily", priority: 0.9 },
  { path: "/diamonds", changefreq: "weekly", priority: 0.9 },
  { path: "/watches", changefreq: "weekly", priority: 0.9 },
  { path: "/markets", changefreq: "daily", priority: 0.9 },
  { path: "/quantum-ticker", changefreq: "daily", priority: 0.8 },
  { path: "/calculator", changefreq: "monthly", priority: 0.8 },
  { path: "/appraisal", changefreq: "monthly", priority: 0.8 },
  { path: "/assistant", changefreq: "weekly", priority: 0.8 },
  { path: "/portfolio", changefreq: "daily", priority: 0.7 },
  { path: "/about", changefreq: "monthly", priority: 0.7 },
  { path: "/api-docs", changefreq: "monthly", priority: 0.6 },
  { path: "/simpletons-list", changefreq: "weekly", priority: 0.6 },
  { path: "/auth", changefreq: "monthly", priority: 0.4 },
];

const DOMAIN = "https://simpletonapp.com";

/**
 * GET /api/seo/sitemap.xml — Dynamic sitemap with lastmod timestamps
 */
router.get("/sitemap.xml", (_req: Request, res: Response) => {
  const now = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const urls = PUBLIC_ROUTES.map(
    (r) => `  <url>
    <loc>${DOMAIN}${r.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  res.set("Content-Type", "application/xml");
  res.set("Cache-Control", "public, max-age=3600"); // Cache 1 hour
  res.send(xml);
});

/**
 * GET /api/seo/structured-data — Returns all JSON-LD schemas for the site
 * Useful for debugging / validating with Google's Rich Results Test
 */
router.get("/structured-data", (_req: Request, res: Response) => {
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Simpleton™",
      alternateName: "SimpletonApp",
      description:
        "AI-powered market intelligence platform for precious metals pricing, diamond grading, Rolex authentication, and financial analytics. Created by Demiris Brown.",
      url: DOMAIN,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Any",
      creator: {
        "@type": "Person",
        name: "Demiris Brown",
        jobTitle: "Founder & Developer",
        worksFor: {
          "@type": "Organization",
          name: "LaDale Industries LLC",
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "LaDale Industries LLC",
      url: DOMAIN,
      logo: `${DOMAIN}/simpleton-logo.jpeg`,
      founder: {
        "@type": "Person",
        name: "Demiris Brown",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Demiris Brown",
      url: DOMAIN,
      jobTitle: "Founder & CEO",
      worksFor: {
        "@type": "Organization",
        name: "LaDale Industries LLC",
      },
      knowsAbout: [
        "Precious metals market analysis",
        "Diamond grading and valuation",
        "Rolex watch authentication",
        "Artificial intelligence",
        "Financial technology",
      ],
    },
  ];

  res.json({ schemas, validationUrl: "https://search.google.com/test/rich-results" });
});

export default router;
