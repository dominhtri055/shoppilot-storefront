"use client";

import { useEffect } from "react";
import { trackStoreEvent } from "@/lib/analytics";

type Props = {
  merchantId: string;
  storeSlug: string;
  productId?: string;
};

export function StoreAnalyticsTracker({
  merchantId,
  storeSlug,
  productId,
}: Props) {
  useEffect(() => {
    void trackStoreEvent({
      merchantId,
      productId: productId ?? null,
      eventType: productId ? "product_viewed" : "session_started",
      metadata: { storeSlug },
    });
  }, [merchantId, productId, storeSlug]);

  return null;
}
