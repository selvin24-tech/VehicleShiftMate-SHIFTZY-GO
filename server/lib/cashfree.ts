import crypto from "crypto";

/**
 * Thin wrapper around the Cashfree Payment Gateway "Orders" API.
 *
 * Everything is driven by environment variables so the app stays portable and
 * has no gateway credentials baked in:
 *   CASHFREE_ENV          "sandbox" (default) | "production"
 *   CASHFREE_APP_ID       gateway client id  (x-client-id)
 *   CASHFREE_SECRET_KEY   gateway client secret (x-client-secret) — also the
 *                         key used to verify webhook signatures
 *   CASHFREE_API_VERSION  x-api-version header (default "2023-08-01")
 *   APP_BASE_URL          public base URL of this app, used to build the
 *                         return_url / notify_url given to Cashfree
 *
 * When the credentials are absent the module reports isConfigured() === false
 * and the payment routes return a clear "not configured" error instead of
 * crashing — nothing here is faked.
 */

const ENV = (process.env.CASHFREE_ENV || "sandbox").toLowerCase();
const APP_ID = process.env.CASHFREE_APP_ID || "";
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY || "";
const API_VERSION = process.env.CASHFREE_API_VERSION || "2023-08-01";

const BASE_URL =
  ENV === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";

export function isConfigured(): boolean {
  return Boolean(APP_ID && SECRET_KEY);
}

export function cashfreeMode(): "sandbox" | "production" {
  return ENV === "production" ? "production" : "sandbox";
}

export function appBaseUrl(): string {
  return (process.env.APP_BASE_URL || "http://localhost:5000").replace(/\/$/, "");
}

function authHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-api-version": API_VERSION,
    "x-client-id": APP_ID,
    "x-client-secret": SECRET_KEY,
  };
}

export interface CreateOrderInput {
  orderId: string;
  amount: number;
  currency?: string;
  customer: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  returnUrl: string;
  notifyUrl?: string;
}

export interface CashfreeOrder {
  cf_order_id?: string | number;
  order_id?: string;
  order_status?: string; // ACTIVE | PAID | EXPIRED | TERMINATED ...
  payment_session_id?: string;
  order_amount?: number;
  [k: string]: unknown;
}

export interface CashfreePayment {
  cf_payment_id?: string | number;
  payment_status?: string; // SUCCESS | FAILED | PENDING | ...
  payment_amount?: number;
  payment_group?: string; // upi | credit_card | net_banking | ...
  payment_method?: unknown;
  bank_reference?: string;
  payment_time?: string;
  [k: string]: unknown;
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string };
    return body?.message || `Cashfree request failed (${res.status})`;
  } catch {
    return `Cashfree request failed (${res.status})`;
  }
}

/** Create an order and get back a payment_session_id for the hosted checkout. */
export async function createOrder(input: CreateOrderInput): Promise<CashfreeOrder> {
  if (!isConfigured()) throw new Error("Cashfree is not configured");

  const body = {
    order_id: input.orderId,
    order_amount: Number(input.amount),
    order_currency: input.currency || "INR",
    customer_details: {
      customer_id: String(input.customer.id),
      customer_name: input.customer.name || undefined,
      customer_email: input.customer.email || undefined,
      customer_phone: input.customer.phone || "9999999999",
    },
    order_meta: {
      return_url: input.returnUrl,
      notify_url: input.notifyUrl || undefined,
    },
  };

  const res = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as CashfreeOrder;
}

/** Authoritative server-side status check for an order. */
export async function getOrder(orderId: string): Promise<CashfreeOrder> {
  if (!isConfigured()) throw new Error("Cashfree is not configured");

  const res = await fetch(`${BASE_URL}/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as CashfreeOrder;
}

/** Payments made against an order (used to record method / reference id). */
export async function getOrderPayments(orderId: string): Promise<CashfreePayment[]> {
  if (!isConfigured()) throw new Error("Cashfree is not configured");

  const res = await fetch(`${BASE_URL}/orders/${encodeURIComponent(orderId)}/payments`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return Array.isArray(data) ? (data as CashfreePayment[]) : [];
}

/**
 * Verify a webhook signature.
 * Cashfree signs `timestamp + rawBody` with HMAC-SHA256 (secret = PG secret
 * key), base64-encoded, and sends it in `x-webhook-signature` with the
 * timestamp in `x-webhook-timestamp`. The raw, unparsed body must be used.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | undefined,
  timestamp: string | undefined
): boolean {
  if (!isConfigured() || !signature || !timestamp) return false;
  const expected = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(timestamp + rawBody)
    .digest("base64");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
