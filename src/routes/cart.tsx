import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "~/components/CartContext";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, itemCount } = useCart();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
        <a href="/" className="hover:text-gray-700">
          Home
        </a>
        <span>/</span>
        <span className="text-gray-900">Cart</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>

      {items.length === 0 ? (
        /* Empty Cart */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-5xl">🛒</span>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Your cart is empty
          </h2>
          <p className="mt-2 text-gray-500">
            Looks like you haven&apos;t added anything yet.
          </p>
          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="mt-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.slug}
                className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-4"
              >
                {/* Product Image */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-24 w-24 flex-shrink-0 rounded-xl bg-gray-50 object-cover"
                />

                {/* Product Details */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link
                      to="/products/$slug"
                      params={{ slug: item.slug }}
                      className="text-sm font-semibold text-gray-900 hover:text-indigo-600"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-lg border border-gray-200">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.slug, item.quantity - 1)
                        }
                        className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="min-w-[2.5rem] text-center text-sm font-medium text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.slug, item.quantity + 1)
                        }
                        className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.slug)}
                      className="text-xs font-medium text-red-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Line Total */}
                <div className="flex flex-col items-end justify-between">
                  <span className="text-sm font-semibold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Order Summary
            </h2>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>
                  Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})
                </span>
                <span className="font-medium">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-medium">
                  {subtotal >= 75 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    "$9.99"
                  )}
                </span>
              </div>
            </div>

            <div className="mt-4 flex justify-between border-t border-gray-200 pt-4 text-base">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-extrabold text-gray-900">
                $
                {(subtotal >= 75 ? subtotal : subtotal + 9.99).toFixed(2)}
              </span>
            </div>

            {subtotal < 75 && (
              <p className="mt-2 text-xs text-gray-400">
                Add ${(75 - subtotal).toFixed(2)} more for free shipping
              </p>
            )}

            <Link
              to="/checkout"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition-colors hover:bg-indigo-700"
            >
              Proceed to Checkout
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
          </div>
        </>
      )}
    </main>
  );
}
