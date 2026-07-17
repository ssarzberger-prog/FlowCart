import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { CartProvider } from "~/components/CartContext";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";

import appCss from "~/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FlowCart — Home Office & Productivity Gadgets" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="text-gray-500">Page not found</p>
      <a
        href="/"
        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        Back to Home
      </a>
    </div>
  ),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <CartProvider>
        <Header />
        <Outlet />
        <Footer />
      </CartProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
