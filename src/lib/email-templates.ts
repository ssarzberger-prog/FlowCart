import type { CartItem } from "./cart-service";

export function formatCartItemsList(items: CartItem[]): string {
  return items
    .map(
      (item) =>
        `- ${item.name} (x${item.quantity}) — $${(item.price * item.quantity).toFixed(2)}`,
    )
    .join("\n");
}

export function getAbandonedCartEmail1(
  firstName: string,
  items: CartItem[],
  cartUrl: string,
): { subject: string; body: string } {
  const itemsList = formatCartItemsList(items);
  return {
    subject: "Did your desk just get jealous? 👀",
    body: `Hey ${firstName || "there"},

You were building a pretty nice workspace — and then... life happened. We get it.

Your cart is still waiting for you:

${itemsList}

→ Return to Your Cart: ${cartUrl}

Here's the thing — these aren't just random gadgets. Every product in your cart was hand-picked to solve a specific desk problem:

- Cluttered cables? → Cable sleeve & clips
- Sore wrists? → Gel wrist rest
- Bad lighting? → Monitor light bar

We've got your back (and your neck, and your wrists).

→ Complete Your Order: ${cartUrl}

Free shipping on all US orders. 30-day satisfaction guarantee.

— Team FlowCart`,
  };
}

export function getAbandonedCartEmail2(
  firstName: string,
  cartUrl: string,
): { subject: string; body: string } {
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

→ See What Customers Love: ${cartUrl}

Every product ships from a US warehouse and comes with a 30-day happiness guarantee. If it doesn't transform your desk, send it back.

→ Complete My Order: ${cartUrl}

— Team FlowCart`,
  };
}

export function getAbandonedCartEmail3(
  firstName: string,
  items: CartItem[],
  cartUrl: string,
): { subject: string; body: string } {
  const itemsList = formatCartItemsList(items);
  return {
    subject: "⏳ Your cart is about to expire",
    body: `Hey ${firstName || "there"},

We noticed you haven't come back to your cart yet, so we're sending this gentle nudge before it clears out.

But first — a little incentive to take the leap:

🎁 Free Cable Management Sleeve ($14 value) on orders over $50 — use code DESKFOCUS at checkout

Here's a recap of what's waiting for you:

${itemsList}

→ Claim My Free Sleeve: ${cartUrl}

This offer expires in 48 hours.

Why FlowCart? No fluff, no overpriced "aesthetic" gear. Just real products that make your desk work better — backed by a 30-day guarantee.

→ Yes, Upgrade My Desk: ${cartUrl}

— Team FlowCart`,
  };
}
