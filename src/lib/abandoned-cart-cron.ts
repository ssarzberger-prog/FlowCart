/**
 * Abandoned cart cron processor.
 * Runs detection, generates email content with templates, records sends.
 * Returns structured email payloads for the agent to send via inbox.
 */
import { sql } from "~/db";
import { initSchema } from "./db-schema";
import type { CartItem } from "./cart-service";
import {
  getAbandonedCartEmail1,
  getAbandonedCartEmail2,
  getAbandonedCartEmail3,
} from "./email-templates";

export interface PendingEmail {
  cartId: number;
  customerEmail: string;
  emailNumber: 1 | 2 | 3;
  subject: string;
  body: string;
}

export async function runAbandonedCartCheck(): Promise<{
  checked: number;
  pending: PendingEmail[];
}> {
  await initSchema();
  const db = sql();

  // Find all active carts older than 1 hour
  const cartRows = await db`
    SELECT c.id, c.customer_email, c.items, c.created_at
    FROM carts c
    WHERE c.status = 'active'
      AND c.customer_email IS NOT NULL
      AND c.created_at < NOW() - INTERVAL '1 hour'
    ORDER BY c.created_at ASC
  `;

  const pending: PendingEmail[] = [];

  for (const cart of cartRows) {
    const cartId = cart.id as number;
    const customerEmail = cart.customer_email as string;
    const items = cart.items as CartItem[];
    const createdAt = new Date(cart.created_at as string).getTime();
    const hoursAgo = (Date.now() - createdAt) / (1000 * 60 * 60);

    // Mark as abandoned
    await db`
      UPDATE carts SET status = 'abandoned', updated_at = NOW()
      WHERE id = ${cartId}
    `;

    // Get customer first name
    const custRows = await db`
      SELECT first_name FROM customers WHERE email = ${customerEmail}
    `;
    const firstName = (custRows[0]?.first_name as string) || "";

    // Cart link
    const cartUrl = `https://flowcart.com/cart`;

    // Email 1: 1-24 hours
    if (hoursAgo >= 1 && hoursAgo < 72) {
      const already = await db`
        SELECT id FROM abandoned_cart_emails
        WHERE cart_id = ${cartId} AND email_number = 1
      `;
      if (already.length === 0) {
        const { subject, body } = getAbandonedCartEmail1(firstName, items, cartUrl);
        await db`
          INSERT INTO abandoned_cart_emails (cart_id, customer_email, email_number, scheduled_for)
          VALUES (${cartId}, ${customerEmail}, 1, NOW())
        `;
        pending.push({ cartId, customerEmail, emailNumber: 1, subject, body });
      }
    }

    // Email 2: 24-72 hours
    if (hoursAgo >= 24 && hoursAgo < 72) {
      const already = await db`
        SELECT id FROM abandoned_cart_emails
        WHERE cart_id = ${cartId} AND email_number = 2
      `;
      if (already.length === 0) {
        const { subject, body } = getAbandonedCartEmail2(firstName, cartUrl);
        await db`
          INSERT INTO abandoned_cart_emails (cart_id, customer_email, email_number, scheduled_for)
          VALUES (${cartId}, ${customerEmail}, 2, NOW())
        `;
        pending.push({ cartId, customerEmail, emailNumber: 2, subject, body });
      }
    }

    // Email 3: 72+ hours
    if (hoursAgo >= 72) {
      const already = await db`
        SELECT id FROM abandoned_cart_emails
        WHERE cart_id = ${cartId} AND email_number = 3
      `;
      if (already.length === 0) {
        const { subject, body } = getAbandonedCartEmail3(firstName, items, cartUrl);
        await db`
          INSERT INTO abandoned_cart_emails (cart_id, customer_email, email_number, scheduled_for)
          VALUES (${cartId}, ${customerEmail}, 3, NOW())
        `;
        pending.push({ cartId, customerEmail, emailNumber: 3, subject, body });
      }
    }
  }

  return { checked: cartRows.length, pending };
}
