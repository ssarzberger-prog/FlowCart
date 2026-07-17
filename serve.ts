// Production server for the built site (Node.js-compatible version).
// Serves static files from dist/client, handles a cron API endpoint,
// and routes everything else through the TanStack Start SSR handler.
import handler from "./dist/server/server.js";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { neon } from "@neondatabase/serverless";

const PORT = 3000;
const HOST = "0.0.0.0";
const CLIENT_DIR = new URL("./dist/client", import.meta.url).pathname;

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

// ── Abandoned Cart Cron Helpers ──────────────────────────────────────

const CART_URL =
  process.env.CART_URL ||
  "https://5b12cb2f8bf15ee469be1ec0705630f3.ctonew.app/cart";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

function formatCartItemsList(items: any[]) {
  return items
    .map(
      (item: any) =>
        `- ${item.name} (x${item.quantity}) — $${(item.price * item.quantity).toFixed(2)}`,
    )
    .join("\n");
}

function email1(firstName: string, items: any[]) {
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

function email2(firstName: string) {
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

function email3(firstName: string, items: any[]) {
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

async function runAbandonedCartCheck() {
  const sql = getDb();

  // Ensure tables exist
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

  const pending: any[] = [];

  for (const cart of cartRows) {
    const cartId = cart.id as number;
    const customerEmail = cart.customer_email as string;
    const items = (cart.items as any[]) || [];
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

    // Email 2: 24+ hours
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

  return { checked: cartRows.length, pending };
}

// ── HTTP Server ──────────────────────────────────────────────────────

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${HOST}:${PORT}`);
  const pathname = url.pathname;

  // ── API: /api/cron/abandoned-carts ──────────────────────────────
  if (
    pathname === "/api/cron/abandoned-carts" ||
    pathname === "/api/cron/abandoned-carts/"
  ) {
    try {
      const result = await runAbandonedCartCheck();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          ...result,
          timestamp: new Date().toISOString(),
        }),
      );
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // ── API: /api/cron/health ───────────────────────────────────────
  if (pathname === "/api/cron/health" || pathname === "/api/cron/health/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, uptime: process.uptime() }));
    return;
  }

  // Try static file first
  if (pathname !== "/") {
    const filePath = join(CLIENT_DIR, pathname);
    if (existsSync(filePath)) {
      const ext = extname(filePath);
      const mime = MIME_TYPES[ext] ?? "application/octet-stream";
      const content = readFileSync(filePath);
      res.writeHead(200, { "Content-Type": mime });
      res.end(content);
      return;
    }
  }

  // SSR fallback — convert Node req/res to a Fetch API Request
  const body = await new Promise<Buffer>((resolve) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const request = new Request(url.toString(), {
    method: req.method ?? "GET",
    headers: Object.entries(req.headers).reduce(
      (acc, [k, v]) => ({ ...acc, [k]: Array.isArray(v) ? v.join(", ") : v ?? "" }),
      {} as Record<string, string>,
    ),
    body: req.method !== "GET" && req.method !== "HEAD" ? body : undefined,
  });

  const response = await (handler as { fetch: (r: Request) => Response | Promise<Response> }).fetch(request);

  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((v, k) => { responseHeaders[k] = v; });

  res.writeHead(response.status, responseHeaders);
  if (response.body) {
    const reader = response.body.getReader();
    const pump = () => {
      reader.read().then(({ done, value }) => {
        if (done) { res.end(); return; }
        res.write(Buffer.from(value));
        pump();
      });
    };
    pump();
  } else {
    res.end();
  }
});

// ── Cron Scheduler ───────────────────────────────────────────────────

let cronInterval: ReturnType<typeof setInterval> | null = null;

function startCron() {
  const runCheck = async () => {
    try {
      const result = await runAbandonedCartCheck();
      if (result.pending.length > 0) {
        console.log(
          `[cron] ${result.checked} carts checked, ${result.pending.length} emails pending`,
        );
      }
    } catch (err: any) {
      console.error(`[cron] error: ${err.message}`);
    }
  };

  // Run immediately, then every 15 minutes
  runCheck();
  cronInterval = setInterval(runCheck, 15 * 60 * 1000);
  console.log("[cron] abandoned cart scheduler started (every 15 min)");
}

server.listen(PORT, HOST, () => {
  console.log(`team-site serving on http://${HOST}:${PORT}`);
  startCron();
});
