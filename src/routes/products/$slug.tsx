import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { readFile } from "node:fs/promises";
import { useState } from "react";
import { useCart } from "~/components/CartContext";
import type { Product } from "~/lib/products";

const PRODUCTS_PATH = "/home/team/shared/products.json";

const getAllProducts = createServerFn({ method: "GET" }).handler(
  async (): Promise<Product[]> => {
    const raw = await readFile(PRODUCTS_PATH, "utf8");
    return JSON.parse(raw) as Product[];
  },
);

const categoryLabels: Record<string, string> = {
  ergonomics: "Ergonomics",
  "cable-management": "Cable Management",
  lighting: "Lighting",
  organization: "Organization",
  accessories: "Accessories",
};

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ params }) => {
    const products = await getAllProducts();
    return products.find((p) => p.slug === params.slug) ?? null;
  },
  component: ProductDetail,
});

function ProductDetail() {
  const product = Route.useLoaderData();
  const { addItem, items } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900">404</h1>
        <p className="text-gray-500">Product not found</p>
        <Link
          to="/products"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const inCart = items.some((i) => i.slug === product.slug);

  const handleAddToCart = () => {
    addItem({
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
        <a href="/" className="hover:text-gray-700">
          Home
        </a>
        <span>/</span>
        <Link to="/products" className="hover:text-gray-700">
          Shop All
        </Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-2xl bg-gray-50">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square w-20 overflow-hidden rounded-xl border-2 transition-colors ${
                    idx === selectedImage
                      ? "border-indigo-600"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} view ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            {categoryLabels[product.category] ?? product.category}
          </span>

          <h1 className="mt-3 text-3xl font-bold text-gray-900">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(product.rating)
                      ? "text-amber-400"
                      : "text-gray-200"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {product.rating}
            </span>
            <span className="text-sm text-gray-400">
              ({product.reviews} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mt-6">
            <span className="text-3xl font-extrabold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
          </div>

          {/* Description */}
          <p className="mt-4 leading-relaxed text-gray-600">
            {product.description}
          </p>

          {/* Features */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900">
              Key Features
            </h3>
            <ul className="mt-3 space-y-2">
              {product.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                  <svg
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feat}
                </li>
              ))}
            </ul>
          </div>

          {/* Add to Cart + Buy Now */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={inCart}
              className={`flex-1 rounded-xl px-8 py-3.5 text-base font-semibold transition-all ${
                inCart
                  ? "bg-green-50 text-green-700 cursor-default"
                  : added
                    ? "bg-green-600 text-white"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200"
              }`}
            >
              {inCart ? "✓ Added to Cart" : added ? "✓ Added!" : "Add to Cart"}
            </button>

            <a
              href={product.stripePaymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-xl border-2 border-indigo-600 bg-white px-8 py-3.5 text-center text-base font-semibold text-indigo-600 transition-colors hover:bg-indigo-50"
            >
              Buy Now
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-6 flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              Secure payment
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
              Free shipping over $75
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M4.031 9.865V4.873h-.002" />
              </svg>
              30-day returns
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
