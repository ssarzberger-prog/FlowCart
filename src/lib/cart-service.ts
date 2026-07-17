import { sql } from "~/db";

export interface CartItem {
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface DbCart {
  id: number;
  customer_email: string | null;
  items: CartItem[];
  status: "active" | "abandoned" | "completed";
  created_at: string;
  updated_at: string;
}

export interface DbOrder {
  id: number;
  customer_email: string;
  items: CartItem[];
  total: number;
  stripe_payment_intent: string | null;
  status: "pending" | "paid" | "fulfilled" | "cancelled";
  created_at: string;
}

/** Create or return an existing active cart for a customer */
export async function getOrCreateCart(
  customerEmail: string,
  items?: CartItem[],
): Promise<DbCart> {
  const db = sql();
  const rows = await db`
    SELECT * FROM carts
    WHERE customer_email = ${customerEmail} AND status = 'active'
    ORDER BY created_at DESC LIMIT 1
  `;
  if (rows.length > 0) {
    const cart = rows[0] as any;
    return {
      id: cart.id,
      customer_email: cart.customer_email,
      items: cart.items as CartItem[],
      status: cart.status,
      created_at: String(cart.created_at),
      updated_at: String(cart.updated_at),
    };
  }
  // Create new cart
  const newRows = await db`
    INSERT INTO carts (customer_email, items, status)
    VALUES (${customerEmail}, ${JSON.stringify(items ?? [])}, 'active')
    RETURNING *
  `;
  const cart = newRows[0] as any;
  return {
    id: cart.id,
    customer_email: cart.customer_email,
    items: cart.items as CartItem[],
    status: cart.status,
    created_at: String(cart.created_at),
    updated_at: String(cart.updated_at),
  };
}

/** Update cart items and status */
export async function updateCart(
  cartId: number,
  items: CartItem[],
  status?: string,
): Promise<DbCart | null> {
  const db = sql();
  const rows = await db`
    UPDATE carts
    SET items = ${JSON.stringify(items)},
        status = COALESCE(${status ?? null}, status),
        updated_at = NOW()
    WHERE id = ${cartId}
    RETURNING *
  `;
  if (rows.length === 0) return null;
  const cart = rows[0] as any;
  return {
    id: cart.id,
    customer_email: cart.customer_email,
    items: cart.items as CartItem[],
    status: cart.status,
    created_at: String(cart.created_at),
    updated_at: String(cart.updated_at),
  };
}

/** Mark a cart as completed (after successful order) */
export async function completeCart(cartId: number): Promise<void> {
  const db = sql();
  await db`
    UPDATE carts SET status = 'completed', updated_at = NOW()
    WHERE id = ${cartId}
  `;
}

/** Find and mark abandoned carts (older than 1 hour) */
export async function findAbandonedCarts(): Promise<DbCart[]> {
  const db = sql();
  const rows = await db`
    SELECT * FROM carts
    WHERE status = 'active'
      AND customer_email IS NOT NULL
      AND created_at < NOW() - INTERVAL '1 hour'
    ORDER BY created_at ASC
  `;
  return rows.map((cart: any) => ({
    id: cart.id,
    customer_email: cart.customer_email,
    items: cart.items as CartItem[],
    status: cart.status,
    created_at: String(cart.created_at),
    updated_at: String(cart.updated_at),
  }));
}

/** Mark a cart as abandoned */
export async function markCartAbandoned(cartId: number): Promise<void> {
  const db = sql();
  await db`
    UPDATE carts SET status = 'abandoned', updated_at = NOW()
    WHERE id = ${cartId}
  `;
}

/** Create an order */
export async function createOrder(
  customerEmail: string,
  items: CartItem[],
  total: number,
): Promise<DbOrder> {
  const db = sql();
  const rows = await db`
    INSERT INTO orders (customer_email, items, total, status)
    VALUES (${customerEmail}, ${JSON.stringify(items)}, ${total}, 'pending')
    RETURNING *
  `;
  const order = rows[0] as any;
  return {
    id: order.id,
    customer_email: order.customer_email,
    items: order.items as CartItem[],
    total: Number(order.total),
    stripe_payment_intent: order.stripe_payment_intent,
    status: order.status,
    created_at: String(order.created_at),
  };
}

/** Upsert a customer */
export async function upsertCustomer(
  email: string,
  firstName?: string,
): Promise<void> {
  const db = sql();
  await db`
    INSERT INTO customers (email, first_name, subscribed)
    VALUES (${email}, ${firstName ?? ""}, true)
    ON CONFLICT (email)
    DO UPDATE SET first_name = COALESCE(${firstName ?? null}, customers.first_name)
  `;
}

/** Record that an abandoned cart email was sent */
export async function recordAbandonedCartEmail(
  cartId: number,
  customerEmail: string,
  emailNumber: number,
  scheduledFor: string,
): Promise<void> {
  const db = sql();
  await db`
    INSERT INTO abandoned_cart_emails (cart_id, customer_email, email_number, scheduled_for)
    VALUES (${cartId}, ${customerEmail}, ${emailNumber}, ${scheduledFor}::timestamptz)
  `;
}

/** Check if a specific email number was already sent for a cart */
export async function hasEmailBeenSent(
  cartId: number,
  emailNumber: number,
): Promise<boolean> {
  const db = sql();
  const rows = await db`
    SELECT id FROM abandoned_cart_emails
    WHERE cart_id = ${cartId} AND email_number = ${emailNumber}
  `;
  return rows.length > 0;
}
