import { createServerFn } from "@tanstack/react-start";
import { initSchema } from "./db-schema";
import {
  getOrCreateCart,
  updateCart,
  completeCart,
  createOrder,
  upsertCustomer,
  findAbandonedCarts,
  markCartAbandoned,
  hasEmailBeenSent,
  recordAbandonedCartEmail,
  type CartItem,
  type DbCart,
} from "./cart-service";
// Import abandoned-cart-cron so Vite includes it in the SSR bundle for serve.ts
import { runAbandonedCartCheck } from "./abandoned-cart-cron";

// --- Cart API ---

export const syncCart = createServerFn({ method: "POST" }).handler(
  async (data: { customerEmail: string; items: CartItem[] }) => {
    await initSchema();
    if (!data.customerEmail) throw new Error("customerEmail required");
    const cart = await getOrCreateCart(data.customerEmail, data.items);
    if (data.items && data.items.length > 0) {
      return updateCart(cart.id, data.items);
    }
    return cart;
  },
);

// --- Checkout API ---

export const processCheckout = createServerFn({ method: "POST" }).handler(
  async (data: {
    customerEmail: string;
    firstName?: string;
    items: CartItem[];
    total: number;
  }) => {
    await initSchema();
    if (!data.customerEmail || !data.items || data.items.length === 0) {
      throw new Error("customerEmail and items required");
    }

    await upsertCustomer(data.customerEmail, data.firstName);
    const cart = await getOrCreateCart(data.customerEmail, data.items);
    await updateCart(cart.id, data.items);

    const order = await createOrder(
      data.customerEmail,
      data.items,
      data.total,
    );

    await completeCart(cart.id);

    return {
      success: true,
      orderId: order.id,
      orderNumber: `FC-${String(order.id).padStart(6, "0")}`,
      total: order.total,
    };
  },
);

// --- Customer API ---

export const registerCustomer = createServerFn({ method: "POST" }).handler(
  async (data: { email: string; firstName?: string }) => {
    await initSchema();
    if (!data.email) throw new Error("email required");
    await upsertCustomer(data.email, data.firstName);
    return { success: true, email: data.email };
  },
);

// --- Abandoned Cart Processing ---

export const processAbandonedCarts = createServerFn({
  method: "POST",
}).handler(async () => {
  await initSchema();
  const results: string[] = [];
  const abandonedCarts = await findAbandonedCarts();

  for (const cart of abandonedCarts) {
    if (!cart.customer_email) continue;
    await markCartAbandoned(cart.id);

    const createdAt = new Date(cart.created_at).getTime();
    const hoursSinceCreation = (Date.now() - createdAt) / (1000 * 60 * 60);

    // Return cart info for email sending (emails sent via inbox tools)
    if (hoursSinceCreation >= 1 && !(await hasEmailBeenSent(cart.id, 1))) {
      const scheduled = new Date().toISOString();
      await recordAbandonedCartEmail(cart.id, cart.customer_email, 1, scheduled);
      results.push(
        `pending_email_1:${cart.id}:${cart.customer_email}:${hoursSinceCreation.toFixed(1)}h`,
      );
    }
    if (
      hoursSinceCreation >= 24 &&
      hoursSinceCreation < 72 &&
      !(await hasEmailBeenSent(cart.id, 2))
    ) {
      const scheduled = new Date().toISOString();
      await recordAbandonedCartEmail(cart.id, cart.customer_email, 2, scheduled);
      results.push(
        `pending_email_2:${cart.id}:${cart.customer_email}:${hoursSinceCreation.toFixed(1)}h`,
      );
    }
    if (
      hoursSinceCreation >= 72 &&
      !(await hasEmailBeenSent(cart.id, 3))
    ) {
      const scheduled = new Date().toISOString();
      await recordAbandonedCartEmail(cart.id, cart.customer_email, 3, scheduled);
      results.push(
        `pending_email_3:${cart.id}:${cart.customer_email}:${hoursSinceCreation.toFixed(1)}h`,
      );
    }
  }

  return {
    processed: abandonedCarts.length,
    results: results.length > 0 ? results : ["No new emails to send"],
  };
});

// --- Abandoned Cart Cron (exposed for serve.ts setInterval) ---

export const runCronCheck = createServerFn({ method: "GET" }).handler(
  async () => {
    return runAbandonedCartCheck();
  },
);
