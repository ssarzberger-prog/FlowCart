import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { readFile } from "node:fs/promises";
import { ProductCard } from "~/components/ProductCard";
import type { Product } from "~/lib/products";

interface Bundle {
  name: string;
  description: string;
  price: number;
  regularPrice: number;
  productSlugs: string[];
  stripePaymentLink: string;
}

// Load products and bundles server-side
const loadHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const raw = await readFile(
    "/home/team/shared/products.json",
    "utf8",
  );
  const products = JSON.parse(raw) as Product[];

  const featured = [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  const bundles: Bundle[] = [
    {
      name: "Desk Starter Kit",
      description:
        "Everything you need to transform your desk: lumbar cushion, cable management kit, and desk organizer set.",
      price: 79.99,
      regularPrice: 104.97,
      productSlugs: [
        "ergonomic-gel-wrist-rest",
        "braided-cable-management-sleeve",
        "zendesk-organizer-set",
      ],
      stripePaymentLink: "https://buy.stripe.com/dRmdR94hxdG6aAde9hfnO0g",
    },
    {
      name: "Pro Workspace Upgrade",
      description:
        "The ultimate home office upgrade: smart LED lamp, monitor stand, and premium desk mat.",
      price: 119.99,
      regularPrice: 144.97,
      productSlugs: [
        "lumismart-led-desk-lamp",
        "elevate-bamboo-monitor-stand",
        "feltspace-premium-desk-mat",
      ],
      stripePaymentLink: "https://buy.stripe.com/3cI5kD3dt59A0ZDfdlfnO0h",
    },
  ];

  const categories = [...new Set(products.map((p) => p.category))];

  return { featured, bundles, categories };
});

const categoryIcons: Record<string, string> = {
  ergonomics: "🪑",
  "cable-management": "🔌",
  lighting: "💡",
  organization: "📦",
  accessories: "✨",
  "desk-organization": "🗄️",
  productivity: "⏱️",
  "smart-lighting": "💡",
};

const categoryLabels: Record<string, string> = {
  ergonomics: "Ergonomics",
  "cable-management": "Cable Management",
  lighting: "Lighting",
  organization: "Organization",
  accessories: "Accessories",
  "desk-organization": "Desk Organization",
  productivity: "Productivity",
  "smart-lighting": "Smart Lighting",
};

export const Route = createFileRoute("/")({
  loader: () => loadHomeData(),
  component: Home,
});

function Home() {
  const { featured, bundles, categories } = Route.useLoaderData();

  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
              <span>🚀</span> Free shipping on orders over $75
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Upgrade Your{" "}
              <span className="text-indigo-600">Workspace</span>
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-gray-600 sm:text-xl">
              Curated home office gadgets that make every workday feel productive
              and comfortable. Ergonomic accessories, smart lighting, cable
              management — all in one place.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-xl"
              >
                Shop All Products
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <a
                href="#bundles"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
              >
                View Bundles
              </a>
            </div>
          </div>
        </div>

        {/* Decorative pattern */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.08),rgba(255,255,255,0))]" />
      </section>

      {/* Categories Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => (
            <Link
              key={cat}
              to="/products"
              search={{ category: cat }}
              className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-6 text-center transition-shadow hover:shadow-md"
            >
              <span className="text-3xl">{categoryIcons[cat] ?? "📦"}</span>
              <span className="text-sm font-medium text-gray-700">
                {categoryLabels[cat] ?? cat}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Featured Products
            </h2>
            <Link
              to="/products"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View All →
            </Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Bundles Section */}
      <section id="bundles" className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Workspace Upgrade Kits
          </h2>
          <p className="mt-2 text-gray-500">
            Save big with our curated bundles — hand-picked to solve real desk
            problems.
          </p>
          <div className="mt-6 grid gap-8 lg:grid-cols-2">
            {bundles.map((bundle) => (
              <div
                key={bundle.name}
                className="relative overflow-hidden rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30 p-8"
              >
                {/* Best value badge */}
                <span className="absolute right-4 top-4 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                  Best Value
                </span>

                <h3 className="text-xl font-bold text-gray-900">
                  {bundle.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {bundle.description}
                </p>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-gray-900">
                    ${bundle.price.toFixed(2)}
                  </span>
                  <span className="text-lg text-gray-400 line-through">
                    ${bundle.regularPrice.toFixed(2)}
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    Save $
                    {(bundle.regularPrice - bundle.price).toFixed(2)}
                  </span>
                </div>

                <a
                  href={bundle.stripePaymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                >
                  Get the {bundle.name}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="border-t border-gray-100 bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 text-center sm:grid-cols-3">
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">🚚</span>
              <h3 className="font-semibold text-gray-900">Free Shipping</h3>
              <p className="text-sm text-gray-500">On all orders over $75</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">🔒</span>
              <h3 className="font-semibold text-gray-900">Secure Checkout</h3>
              <p className="text-sm text-gray-500">
                Payments processed by Stripe
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">↩️</span>
              <h3 className="font-semibold text-gray-900">30-Day Returns</h3>
              <p className="text-sm text-gray-500">Hassle-free returns policy</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
