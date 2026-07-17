import { Link } from "@tanstack/react-router";
import { useCart } from "./CartContext";
import { useState } from "react";

export function Header() {
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold tracking-tight text-gray-900"
        >
          Flow<span className="text-indigo-600">Cart</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            to="/"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            activeProps={{ className: "text-indigo-600 font-semibold" }}
          >
            Home
          </Link>
          <Link
            to="/products"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            activeProps={{ className: "text-indigo-600 font-semibold" }}
          >
            Shop All
          </Link>
          <Link
            to="/blog"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            activeProps={{ className: "text-indigo-600 font-semibold" }}
          >
            Blog
          </Link>
        </nav>

        {/* Cart + Mobile Toggle */}
        <div className="flex items-center gap-4">
          <Link
            to="/cart"
            className="relative inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
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
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            Cart
            {itemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
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
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 md:hidden">
          <Link
            to="/"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/products"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            Shop All
          </Link>
        </nav>
      )}
    </header>
  );
}
