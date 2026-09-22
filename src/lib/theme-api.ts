import { cache } from "react";
import { getSupabasePublicConfig } from "./supabase";
import { defaultTheme, normalizeTheme } from "./store-theme";
export const getPublicTheme = cache(async (slug: string) => {
  const { url, publishableKey } = getSupabasePublicConfig();
  const response = await fetch(`${url}/rest/v1/rpc/get_public_store_theme`, {
    method: "POST",
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_store_slug: slug }),
    cache: "no-store",
  });
  if (response.status === 404) return defaultTheme; // Existing stores work before migration.
  if (!response.ok)
    throw new Error("Could not load the store appearance. Please try again.");
  return normalizeTheme(await response.json());
});
