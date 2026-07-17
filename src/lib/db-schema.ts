import { sql } from "~/db";

/**
 * Initialize database tables for FlowCart backend.
 * Idempotent — uses IF NOT EXISTS.
 */
export async function initSchema() {
  const db = sql();

  await db`CREATE TABLE IF NOT EXISTS customers (
    email TEXT PRIMARY KEY,
    first_name TEXT NOT NULL DEFAULT '',
    subscribed BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;

  await db`CREATE TABLE IF NOT EXISTS carts (
    id SERIAL PRIMARY KEY,
    customer_email TEXT REFERENCES customers(email),
    items JSONB NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'active'
      CHECK (status IN ('active','abandoned','completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;

  await db`CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_email TEXT REFERENCES customers(email),
    items JSONB NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    stripe_payment_intent TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending','paid','fulfilled','cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;

  await db`CREATE TABLE IF NOT EXISTS abandoned_cart_emails (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER REFERENCES carts(id),
    customer_email TEXT NOT NULL,
    email_number INTEGER NOT NULL CHECK (email_number IN (1,2,3)),
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    scheduled_for TIMESTAMPTZ NOT NULL
  )`;
}
