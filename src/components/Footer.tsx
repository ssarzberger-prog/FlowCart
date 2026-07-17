import { Link } from "@tanstack/react-router";

export function Footer() {
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

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Company</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} FlowCart. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
