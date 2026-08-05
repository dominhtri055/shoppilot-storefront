"use client";

type AnalyticsEventType =
  | "session_started"
  | "product_viewed"
  | "product_added_to_cart"
  | "checkout_started"
  | "checkout_completed";

type TrackEventInput = {
  merchantId: string;
  eventType: AnalyticsEventType;
  productId?: string | null;
  metadata?: Record<string, unknown>;
};

const SESSION_KEY = "shoppilot-analytics-session";

function getSessionId() {
  if (typeof window === "undefined") return "";

  const current = window.localStorage.getItem(SESSION_KEY);
  if (current) return current;

  const next = [
    "session",
    Date.now().toString(36),
    Math.random().toString(36).slice(2, 12),
  ].join("-");

  window.localStorage.setItem(SESSION_KEY, next);
  return next;
}

export async function trackStoreEvent({
  merchantId,
  eventType,
  productId = null,
  metadata = {},
}: TrackEventInput) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!baseUrl || !publishableKey) return;

  const sessionId = getSessionId();
  if (!sessionId) return;

  const response = await fetch(
    `${baseUrl}/rest/v1/rpc/record_store_event`,
    {
      method: "POST",
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${publishableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_merchant_id: merchantId,
        p_session_id: sessionId,
        p_event_type: eventType,
        p_product_id: productId,
        p_metadata: metadata,
      }),
      keepalive: true,
    },
  );

  if (!response.ok && process.env.NODE_ENV === "development") {
    console.warn("ShopPilot analytics event failed:", eventType);
  }
}
