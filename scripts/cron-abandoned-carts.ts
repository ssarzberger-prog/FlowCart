/**
 * Standalone abandoned cart cron script.
 * Runs in the sandbox environment (not on the published server).
 * Connects directly to Neon Postgres, detects abandoned carts,
 * generates email payloads, and writes them to a JSON file for the agent to send.
 *
 * Usage: bun run scripts/cron-abandoned-carts.ts [--send]
 *   Without --send: just detects and writes pending emails to /tmp/pending-emails.json
 *   With --send: also outputs emails that need to be sent
 */
import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const CART_URL = "https://5b12cb2f8bf15ee469be1ec0705630f3.ctonew.app/cart";
const PENDING_FILE = "/tmp/pending-abandoned-emails.json";

interface CartItem {
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface PendingEmail {
  cartId: number;
  customerEmail: string;
  emailNumber: 1 | 2 | 3;
  subject: string;
  body: string;
  firstName: string;
}

// ── Email Templates ────────────────────────────────────────────────

function formatCartItemsList(items: CartItem[]): string {
  return items
    .map(
      (item) =>
        `- ${item.name} (x${item.quantity}) — $${(item.price * item.quantity).toFixed(2)}`,
    )
    .join("\n");
}

function email1(firstName: string, items: CartItem[]): { subject: string; body: string } {
  const itemsList = formatCartItemsList(items);
  return {
    subject: "Did your desk just get jealous? 👀",
    body: `Hey ${firstName || "there"},

You were building a pretty nice workspace — and then... life happened. We get it.

Your cart is still waiting for you:

${itemsList}

→ Return to Your Cart: ${CART_URL}

Here's the thing — these aren't just random gadgets. Every product in your cart was hand-picked to solve a specific desk problem:

- Cluttered cables? → Cable sleeve & clips
- Sore wrists? → Gel wrist rest
- Bad lighting? → Monitor light bar

We've got your back (and your neck, and your wrists).

→ Complete Your Order: ${CART_URL}

Free shipping on all US orders. 30-day satisfaction guarantee.

— Team FlowCart`,
  };
}

function email2(firstName: string): { subject: string; body: string } {
  return {
    subject: "Real talk about your desk setup 🎯",
    body: `Hey ${firstName || "there"},

Quick question: what's stopping you?

Maybe you're not sure it'll fit your setup. Maybe you're wondering if it's actually worth it.

Here's what real FlowCart customers are saying:

> "I didn't realize how much the monitor light bar would change my late-night workflow. Game changer."
> — Sarah K., remote designer

> "The cable sleeve alone saved my sanity. Why did I wait so long?"
> — Marcus T., software engineer

> "My wrist pain disappeared after a week with the gel rest. Best $22 I've ever spent."
> — Priya R., content strategist

→ See What Customers Love: ${CART_URL}

Every product ships from a US warehouse and comes with a 30-day happiness guarantee. If it doesn't transform your desk, send it back.

→ Complete My Order: ${CART_URL}

— Team FlowCart`,
  };
}

function email3(firstName: string, items: CartItem[]): { subject: string; body: string } {
  const itemsList = formatCartItemsList(items);
  return {
    subject: "⏳ Your cart is about to expire",
    body: `Hey ${firstName || "there"},

We noticed you haven't come back to your cart yet, so we're sending this gentle nudge before it clears out.

But first — a little incentive to take the leap:

🎁 Free Cable Management Sleeve ($14 value) on orders over $50 — use code DESKFOCUS at checkout

Here's a recap of what's waiting for you:

${itemsList}

→ Claim My Free Sleeve: ${CART_URL}

This offer expires in 48 hours.

Why FlowCart? No fluff, no overpriced "aesthetic" gear. Just real products that make your desk work better — backed by a 30-day guarantee.

→ Yes, Upgrade My Desk: ${CART_URL}

— Team FlowCart`,
  };
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  const sql = neon(DATABASE_URL!);
  const pending: PendingEmail[] = [];

  try {
    // Ensure schema exists
    await sql`CREATE TABLE IF NOT EXISTS customers (
      email TEXT PRIMARY KEY,
      first_name TEXT NOT NULL DEFAULT '',
      subscribed BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS carts (
      id SERIAL PRIMARY KEY,
      customer_email TEXT REFERENCES customers(email),
      items JSONB NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active','abandoned','completed')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS abandoned_cart_emails (
      id SERIAL PRIMARY KEY,
      cart_id INTEGER REFERENCES carts(id),
      customer_email TEXT NOT NULL,
      email_number INTEGER NOT NULL CHECK (email_number IN (1,2,3)),
      sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      scheduled_for TIMESTAMPTZ NOT NULL
    )`;

    // Find active carts older than 1 hour
    const cartRows = await sql`
      SELECT c.id, c.customer_email, c.items, c.created_at
      FROM carts c
      WHERE c.status = 'active'
        AND c.customer_email IS NOT NULL
        AND c.created_at < NOW() - INTERVAL '1 hour'
      ORDER BY c.created_at ASC
    `;

    let checked = 0;

    for (const cart of cartRows) {
      checked++;
      const cartId = cart.id as number;
      const customerEmail = cart.customer_email as string;
      const items = (cart.items as CartItem[]) || [];
      const createdAt = new Date(cart.created_at as string).getTime();
      const hoursAgo = (Date.now() - createdAt) / (1000 * 60 * 60);

      // Mark abandoned
      await sql`
        UPDATE carts SET status = 'abandoned', updated_at = NOW()
        WHERE id = ${cartId}
      `;

      // Get first name
      const custRows = await sql`
        SELECT first_name FROM customers WHERE email = ${customerEmail}
      `;
      const firstName = (custRows[0]?.first_name as string) || "";

      // Email 1: 1+ hours
      if (hoursAgo >= 1) {
        const already = await sql`
          SELECT id FROM abandoned_cart_emails
          WHERE cart_id = ${cartId} AND email_number = 1
        `;
        if (already.length === 0) {
          const { subject, body } = email1(firstName, items);
          await sql`
            INSERT INTO abandoned_cart_emails (cart_id, customer_email, email_number, scheduled_for)
            VALUES (${cartId}, ${customerEmail}, 1, NOW())
          `;
          pending.push({ cartId, customerEmail, emailNumber: 1, subject, body, firstName });
        }
      }

      // Email 2: 24-72 hours
      if (hoursAgo >= 24) {
        const already = await sql`
          SELECT id FROM abandoned_cart_emails
          WHERE cart_id = ${cartId} AND email_number = 2
        `;
        if (already.length === 0) {
          const { subject, body } = email2(firstName);
          await sql`
            INSERT INTO abandoned_cart_emails (cart_id, customer_email, email_number, scheduled_for)
            VALUES (${cartId}, ${customerEmail}, 2, NOW())
          `;
          pending.push({ cartId, customerEmail, emailNumber: 2, subject, body, firstName });
        }
      }

      // Email 3: 72+ hours
      if (hoursAgo >= 72) {
        const already = await sql`
          SELECT id FROM abandoned_cart_emails
          WHERE cart_id = ${cartId} AND email_number = 3
        `;
        if (already.length === 0) {
          const { subject, body } = email3(firstName, items);
          await sql`
            INSERT INTO abandoned_cart_emails (cart_id, customer_email, email_number, scheduled_for)
            VALUES (${cartId}, ${customerEmail}, 3, NOW())
          `;
          pending.push({ cartId, customerEmail, emailNumber: 3, subject, body, firstName });
        }
      }
    }

    const result = {
      checked,
      pendingCount: pending.length,
      pending,
      timestamp: new Date().toISOString(),
    };

    // Write to file
    const fs = await import("node:fs");
    fs.writeFileSync(PENDING_FILE, JSON.stringify(result, null, 2));
    console.log(JSON.stringify({ checked, pending: pending.length, timestamp: result.timestamp }));

    if (pending.length > 0) {
      console.error(`\n📬 ${pending.length} email(s) pending — see ${PENDING_FILE}`);
    }
  } catch (err: any) {
    console.error(`cron error: ${err.message}`);
    process.exit(1);
  }
}

main();
