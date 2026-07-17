import { createServerFn } from "@tanstack/react-start";
import { products as allProducts } from "./products-data";

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  cost: number;
  description: string;
  features: string[];
  images: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  stripePaymentLink: string;
}

export const getAllProducts = createServerFn({ method: "GET" }).handler(
  async (): Promise<Product[]> => {
    return allProducts as Product[];
  },
);

export const getProductBySlug = createServerFn({ method: "GET" })
  .handler(async (slug: string): Promise<Product | null> => {
    const products = await getAllProducts();
    return products.find((p) => p.slug === slug) ?? null;
  });

export const getFeaturedProducts = createServerFn({ method: "GET" }).handler(
  async (): Promise<Product[]> => {
    // Featured = top-rated, pick top 4
    return [...allProducts].sort((a, b) => b.rating - a.rating).slice(0, 4);
  },
);

export const getCategories = createServerFn({ method: "GET" }).handler(
  async (): Promise<string[]> => {
    return [...new Set(allProducts.map((p) => p.category))];
  },
);
