import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { readFile } from "node:fs/promises";
import { useState, useMemo } from "react";
import { ProductCard } from "~/components/ProductCard";
import type { Product } from "~/lib/products";

const PRODUCTS_PATH = "/home/team/shared/products.json";

const loadProducts = createServerFn({ method: "GET" }).handler(async () => {
  const raw = await readFile(PRODUCTS_PATH, "utf8");
  return JSON.parse(raw) as Product[];
});

const categoryLabels: Record<string, string> = {
  ergonomics: "Ergonomics",
  "cable-management": "Cable Management",
  lighting: "Lighting",
  organization: "Organization",
  accessories: "Accessories",
};

interface SearchParams {
  category?: string;
  sort?: string;
}

export const Route = createFileRoute("/products/")({
  loader: () => loadProducts(),
  validateSearch: (params: Record<string, string>): SearchParams => ({
    category: params.category,
    sort: params.sort || "featured",
  }),
  component: ProductsCatalog,
});

function ProductsCatalog() {
  const products = Route.useLoaderData();
  const { category, sort } = Route.useSearch();
  const [search, setSearch] = useState("");

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))],
    [products],
  );

  const filtered = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (category) {
      result = result.filter((p) => p.category === category);
    }

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }

    // Sort
    switch (sort) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "featured":
      default:
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [products, category, search, sort]);

  const updateSearch = (updates: Partial<SearchParams>) => {
    const current = { category, sort };
    // Navigate with search params
    const params = new URLSearchParams();
    const merged = { ...current, ...updates };
    if (merged.category) params.set("category", merged.category);
    if (merged.sort && merged.sort !== "featured")
      params.set("sort", merged.sort);
    window.history.replaceState(
      null,
      "",
      `/products${params.toString() ? "?" + params.toString() : ""}`,
    );
    // Reload to apply search params
    window.location.href = `/products${params.toString() ? "?" + params.toString() : ""}`;
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <a href="/" className="hover:text-gray-700">
          Home
        </a>
        <span>/</span>
        <span className="text-gray-900">Shop All</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
        <p className="mt-2 text-gray-500">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""} for your
          workspace
        </p>
      </div>

      {/* Filters Bar */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* Category & Sort */}
        <div className="flex flex-wrap gap-2">
          {/* Category pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => updateSearch({ category: undefined })}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                !category
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => updateSearch({ category: cat })}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  category === cat
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {categoryLabels[cat] ?? cat}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sort || "featured"}
            onChange={(e) => updateSearch({ sort: e.target.value })}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 focus:border-indigo-300 focus:outline-none"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-4xl">🔍</span>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            No products found
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              updateSearch({ category: undefined, sort: "featured" });
            }}
            className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Clear all filters
          </button>
        </div>
      )}
    </main>
  );
}
