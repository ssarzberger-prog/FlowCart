import { Link } from "@tanstack/react-router";
import { useCart } from "./CartContext";
import type { Product } from "~/lib/products";

interface ProductCardProps {
  product: Product;
}

const categoryLabels: Record<string, string> = {
  ergonomics: "Ergonomics",
  "cable-management": "Cable Mgmt",
  lighting: "Lighting",
  organization: "Organization",
  accessories: "Accessories",
};

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, items } = useCart();
  const inCart = items.some((i) => i.slug === product.slug);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
  };

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-shadow hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm backdrop-blur">
          {categoryLabels[product.category] ?? product.category}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Rating */}
        <div className="mb-1 flex items-center gap-1">
          <svg
            className="h-4 w-4 text-amber-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-xs font-medium text-gray-600">
            {product.rating}
          </span>
          <span className="text-xs text-gray-400">
            ({product.reviews})
          </span>
        </div>

        <h3 className="text-sm font-semibold leading-tight text-gray-900">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-gray-500">
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-lg font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={inCart}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              inCart
                ? "bg-green-50 text-green-700 cursor-default"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {inCart ? "In Cart ✓" : "Add to Cart"}
          </button>
        </div>

        {/* Buy Now link */}
        <a
          href={product.stripePaymentLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-2 block w-full rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-center text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50"
        >
          Buy Now →
        </a>
      </div>
    </Link>
  );
}
