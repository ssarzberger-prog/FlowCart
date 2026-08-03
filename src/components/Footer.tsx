import { Link } from "@tanstack/react-router";
import { useState } from "react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "footer" }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Thanks for subscribing!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link
              to="/"
              className="text-lg font-bold tracking-tight text-gray-900"
            >
              Flow<span className="text-indigo-600">Cart</span>
            </Link>
            <p className="mt-2 text-sm text-gray-500">
              Curated home office & productivity gadgets for the modern remote
              worker.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Shop</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  to="/products"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Support</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                  Returns & Refunds
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Get 10% Off
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Subscribe for exclusive deals and a WELCOME10 discount code.
            </p>

            {status === "success" ? (
              <div className="mt-3 rounded-lg bg-green-50 p-3">
                <p className="text-sm font-medium text-green-700">
                  {message}
                </p>
                <p className="mt-1 text-xs font-bold text-green-800">
                  Code: WELCOME10
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="mt-3">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-100"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="flex-shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {status === "loading" ? "..." : "Join"}
                  </button>
                </div>
                {status === "error" && (
                  <p className="mt-2 text-xs text-red-500">{message}</p>
                )}
              </form>
            )}
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} FlowCart. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
