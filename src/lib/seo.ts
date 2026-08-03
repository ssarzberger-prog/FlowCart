/**
 * SEO utility helpers for FlowCart.
 * Generates meta tags, Open Graph / Twitter cards, JSON-LD structured data,
 * and canonical URLs.
 */
import type { Product } from "./products";

const SITE_URL = "https://flowcart.com";
const SITE_NAME = "FlowCart";
const SITE_DESCRIPTION =
  "Curated home office gadgets that make every workday feel productive and comfortable. Ergonomic accessories, smart lighting, cable management — all in one place.";
const TWITTER_HANDLE = "@flowcart";

export interface SeoMetaInput {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: "website" | "product" | "article";
}

/** Generate standard meta + OG + Twitter tags for TanStack Start head() */
export function seoMeta(input: SeoMetaInput) {
  const { title, description, url, image, type = "website" } = input;
  const fullTitle = title.includes("FlowCart") ? title : `${title} — FlowCart`;
  const fullUrl = url ? `${SITE_URL}${url}` : SITE_URL;
  const ogImage =
    image || `${SITE_URL}/images/og-default.jpg`;

  return {
    title: fullTitle,
    meta: [
      { name: "description", content: description },
      // Open Graph
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:type", content: type },
      { property: "og:url", content: fullUrl },
      { property: "og:image", content: ogImage },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:site_name", content: SITE_NAME },
      // Twitter Card
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: ogImage },
      { name: "twitter:site", content: TWITTER_HANDLE },
    ],
    links: [
      { rel: "canonical", href: fullUrl },
    ],
  };
}

/** SEO for the homepage */
export function homeSeo() {
  return seoMeta({
    title: "FlowCart — Curated Home Office & Productivity Gadgets",
    description: SITE_DESCRIPTION,
    url: "/",
    type: "website",
  });
}

/** SEO for the product catalog page */
export function productsCatalogSeo(productCount: number) {
  return seoMeta({
    title: "Shop All Products",
    description: `Browse ${productCount}+ curated home office and productivity gadgets — ergonomic accessories, smart lighting, desk organizers, and cable management solutions.`,
    url: "/products",
    type: "website",
  });
}

/** SEO for a single product detail page */
export function productDetailSeo(product: Product) {
  return seoMeta({
    title: product.name,
    description:
      product.description.length > 155
        ? product.description.slice(0, 152) + "..."
        : product.description,
    url: `/products/${product.slug}`,
    image: product.images[0]?.startsWith("http")
      ? product.images[0]
      : `${SITE_URL}${product.images[0]}`,
    type: "product",
  });
}

/** SEO for the blog */
export function blogSeo() {
  return seoMeta({
    title: "10 Desk Upgrades Under $50 — FlowCart Blog",
    description:
      "Discover 10 affordable desk upgrades that transform your home office. From cable management to ergonomic essentials — all under $50.",
    url: "/blog",
    type: "article",
  });
}

/** SEO for the cart page */
export function cartSeo() {
  return seoMeta({
    title: "Shopping Cart",
    description: "Review your FlowCart items and proceed to checkout.",
    url: "/cart",
    type: "website",
  });
}

/** SEO for the checkout page */
export function checkoutSeo() {
  return seoMeta({
    title: "Checkout",
    description: "Complete your FlowCart order securely.",
    url: "/checkout",
    type: "website",
  });
}

/** SEO for the order confirmation page */
export function orderConfirmationSeo() {
  return seoMeta({
    title: "Order Confirmed",
    description: "Your FlowCart order has been placed successfully.",
    url: "/order-confirmation",
    type: "website",
  });
}

// ── JSON-LD Structured Data ─────────────────────────────────────────

/** Organization + WebSite schema for the homepage */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    sameAs: [
      "https://twitter.com/flowcart",
      "https://instagram.com/flowcart",
    ],
  };
}

/** WebSite schema with SearchAction */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/** Product schema for a single product */
export function productSchema(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((img) =>
      img.startsWith("http") ? img : `${SITE_URL}${img}`,
    ),
    sku: product.id,
    offers: {
      "@type": "Offer",
      price: product.price.toFixed(2),
      priceCurrency: "USD",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/products/${product.slug}`,
    },
    ...(product.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating.toString(),
        reviewCount: product.reviews.toString(),
      },
    }),
  };
}

/** BreadcrumbList schema for product pages */
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

/** ItemList schema for the products catalog */
export function itemListSchema(products: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((product, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/products/${product.slug}`,
    })),
  };
}

// ── Sitemap XML ─────────────────────────────────────────────────────

/** Generate an XML sitemap string */
export function generateSitemapXml(products: Product[]): string {
  const urls: { loc: string; priority: string; changefreq: string }[] = [
    { loc: `${SITE_URL}/`, priority: "1.0", changefreq: "daily" },
    { loc: `${SITE_URL}/products`, priority: "0.9", changefreq: "daily" },
    { loc: `${SITE_URL}/blog`, priority: "0.8", changefreq: "weekly" },
    { loc: `${SITE_URL}/cart`, priority: "0.3", changefreq: "never" },
    { loc: `${SITE_URL}/checkout`, priority: "0.3", changefreq: "never" },
  ];

  for (const product of products) {
    urls.push({
      loc: `${SITE_URL}/products/${product.slug}`,
      priority: "0.7",
      changefreq: "weekly",
    });
  }

  const urlElements = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n    <priority>${u.priority}</priority>\n    <changefreq>${u.changefreq}</changefreq>\n  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
