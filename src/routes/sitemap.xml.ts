import { products } from "~/lib/products-data";

const BASE_URL = "https://flowcart-cyan.vercel.app";

const staticPages = [
  { path: "", priority: "1.0", changefreq: "daily" },
  { path: "/products", priority: "0.9", changefreq: "daily" },
  { path: "/blog", priority: "0.8", changefreq: "weekly" },
  { path: "/cart", priority: "0.5", changefreq: "weekly" },
];

export function generateSitemap(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (p) => `  <url>
    <loc>${BASE_URL}${p.path}</loc>
    <priority>${p.priority}</priority>
    <changefreq>${p.changefreq}</changefreq>
  </url>`
  )
  .join("\n")}
${products
  .map(
    (p) => `  <url>
    <loc>${BASE_URL}/products/${p.slug}</loc>
    <priority>0.7</priority>
    <changefreq>weekly</changefreq>
  </url>`
  )
  .join("\n")}
</urlset>`;
}
