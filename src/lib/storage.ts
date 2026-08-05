import { getSupabasePublicConfig } from "@/lib/supabase";

function getPublicStorageUrl(bucket: string, path: string) {
  const { url } = getSupabasePublicConfig();
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${url}/storage/v1/object/public/${bucket}/${encodedPath}`;
}

export function getProductImageUrl(path: string) {
  return getPublicStorageUrl("product-images", path);
}

export function getStoreLogoUrl(path: string) {
  return getPublicStorageUrl("store-logos", path);
}
