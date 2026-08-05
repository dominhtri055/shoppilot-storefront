import { cache } from "react";
import { getSupabasePublicConfig } from "@/lib/supabase";
import type { PublicProduct, PublicStore } from "@/types/storefront";

type PublicStoreRow = {
  merchant_id: string;
  store_slug: string;
  store_name: string;
  business_email: string | null;
  store_description: string | null;
  currency: string;
  logo_path: string | null;
};

type PublicProductRow = {
  id: string;
  merchant_id: string;
  title: string;
  vendor: string;
  price: number | string;
  inventory: number;
  tags: string[] | null;
  image_path: string | null;
  updated_at: string;
};

async function rpcRequest<T>(
  functionName: string,
  body: Record<string, unknown>,
): Promise<T> {
  const { url, publishableKey } = getSupabasePublicConfig();
  const response = await fetch(
    `${url}/rest/v1/rpc/${functionName}`,
    {
      method: "POST",
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${publishableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      next: { revalidate: 30 },
    },
  );

  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    const error = payload as {
      message?: string;
      details?: string;
      hint?: string;
    };

    throw new Error(
      error.message ??
        error.details ??
        error.hint ??
        "Storefront request failed.",
    );
  }

  return payload as T;
}

function mapStore(row: PublicStoreRow): PublicStore {
  return {
    merchantId: row.merchant_id,
    storeSlug: row.store_slug,
    storeName: row.store_name,
    businessEmail: row.business_email ?? "",
    description: row.store_description ?? "",
    currency: row.currency,
    logoPath: row.logo_path,
  };
}

function mapProduct(row: PublicProductRow): PublicProduct {
  return {
    id: row.id,
    merchantId: row.merchant_id,
    title: row.title,
    vendor: row.vendor,
    price: Number(row.price),
    inventory: row.inventory,
    tags: row.tags ?? [],
    imagePath: row.image_path,
    updatedAt: row.updated_at,
  };
}

export const getPublicStore = cache(
  async (storeSlug: string): Promise<PublicStore | null> => {
    const data = await rpcRequest<PublicStoreRow[]>(
      "get_public_store",
      { p_store_slug: storeSlug },
    );

    const row = data[0];
    return row ? mapStore(row) : null;
  },
);

export const getPublicProducts = cache(
  async (storeSlug: string): Promise<PublicProduct[]> => {
    const data = await rpcRequest<PublicProductRow[]>(
      "get_public_products",
      { p_store_slug: storeSlug },
    );

    return data.map(mapProduct);
  },
);

export const getPublicProduct = cache(
  async (
    storeSlug: string,
    productId: string,
  ): Promise<PublicProduct | null> => {
    const data = await rpcRequest<PublicProductRow[]>(
      "get_public_product",
      {
        p_store_slug: storeSlug,
        p_product_id: productId,
      },
    );

    const row = data[0];
    return row ? mapProduct(row) : null;
  },
);
