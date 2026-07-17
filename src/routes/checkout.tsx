import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useCart } from "~/components/CartContext";
import { processCheckout } from "~/lib/api-handlers";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

function CheckoutPage() {
  const { items, subtotal, itemCount, clearCart, setCustomerEmail } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState<CheckoutForm>({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");

  const shipping = subtotal >= 75 ? 0 : 9.99;
  const total = subtotal + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const data = await processCheckout({
        customerEmail: form.email,
        firstName: form.firstName,
        items,
        total: Math.round(total * 100) / 100,
      });
      setCustomerEmail(form.email);
      setOrderNumber(data.orderNumber);
      setSubmitted(true);
      clearCart();
      setTimeout(() => {
        navigate({ to: "/order-confirmation" });
      }, 1500);
    } catch (err: any) {
      setError(err.message ?? "Network error");
    }
  };

  // If cart is empty and not just submitted, redirect
  if (items.length === 0 && !submitted) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 text-center">
        <span className="text-5xl">🛒</span>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Your cart is empty
        </h1>
        <p className="mt-2 text-gray-500">
          Add some products before checking out.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white"
        >
          Browse Products
        </Link>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
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
        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          Processing your order...
        </h1>
        <p className="mt-2 text-gray-500">Redirecting you shortly.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
        <a href="/" className="hover:text-gray-700">
          Home
        </a>
        <span>/</span>
        <Link to="/cart" className="hover:text-gray-700">
          Cart
        </Link>
        <span>/</span>
        <span className="text-gray-900">Checkout</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-5">
        {/* Shipping Form */}
        <div className="space-y-6 lg:col-span-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Shipping Information
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={form.firstName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={form.lastName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="mt-4">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                required
                value={form.address}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700"
                >
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  value={form.city}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700"
                >
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  required
                  value={form.state}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label
                  htmlFor="zip"
                  className="block text-sm font-medium text-gray-700"
                >
                  ZIP Code
                </label>
                <input
                  type="text"
                  id="zip"
                  name="zip"
                  required
                  value={form.zip}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-2xl border border-gray-100 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Order Summary
            </h2>

            <div className="mt-4 divide-y divide-gray-200">
              {items.map((item) => (
                <div
                  key={item.slug}
                  className="flex items-center gap-3 py-3"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-12 w-12 flex-shrink-0 rounded-lg bg-gray-100 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>
                  Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})
                </span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>
            </div>

            <div className="mt-4 flex justify-between border-t border-gray-200 pt-4 text-base">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-extrabold text-gray-900">
                ${total.toFixed(2)}
              </span>
            </div>

            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition-colors hover:bg-indigo-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
              Place Order
            </button>

            <p className="mt-3 text-center text-xs text-gray-400">
              Demo checkout — no real payment processed
            </p>
          </div>
        </div>
      </form>
    </main>
  );
}
