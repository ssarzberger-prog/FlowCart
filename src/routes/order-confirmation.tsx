import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/order-confirmation")({
  component: OrderConfirmation,
});

function OrderConfirmation() {
  const orderNumber = `FC-${Date.now().toString(36).toUpperCase().slice(-8)}`;

  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
      {/* Success Icon */}
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <svg
          className="h-10 w-10 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="mt-6 text-3xl font-bold text-gray-900">
        Order Confirmed!
      </h1>
      <p className="mt-3 text-lg text-gray-500">
        Thank you for your purchase. Your order has been placed successfully.
      </p>

      {/* Order Details */}
      <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50 p-6 text-left">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">
            Order number
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {orderNumber}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">
            Estimated delivery
          </span>
          <span className="text-sm font-semibold text-gray-900">
            5–7 business days
          </span>
        </div>
      </div>

      {/* Next Steps */}
      <div className="mt-8 space-y-4">
        <p className="text-sm text-gray-500">
          A confirmation email will be sent shortly with your order details and
          tracking information once your package ships.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Continue Shopping
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Back to Home
          </Link>
        </div>
      </div>

      {/* Recommended Products */}
      <div className="mt-16">
        <h2 className="text-xl font-bold text-gray-900">
          You Might Also Like
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Complete your workspace setup
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { name: "CloudRest Wrist Rest", price: "$24.99", emoji: "⌨️" },
            { name: "FocusZone Panels", price: "$49.99", emoji: "🔇" },
            { name: "FeltSpace Desk Mat", price: "$39.99", emoji: "🖱️" },
          ].map((rec) => (
            <Link
              key={rec.name}
              to="/products"
              className="rounded-2xl border border-gray-100 bg-white p-4 text-center transition-shadow hover:shadow-md"
            >
              <span className="text-3xl">{rec.emoji}</span>
              <p className="mt-2 text-sm font-medium text-gray-900">
                {rec.name}
              </p>
              <p className="text-sm font-semibold text-indigo-600">
                {rec.price}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
