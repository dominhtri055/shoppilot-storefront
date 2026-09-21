import { notFound } from "next/navigation";
import { StoreView } from "@/components/StoreView";
import { StoreAnalyticsTracker } from "@/components/StoreAnalyticsTracker";
import { getPublicProducts, getPublicStore } from "@/lib/storefront-api";
import { getPublicTheme } from "@/lib/theme-api";
export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [store, products, theme] = await Promise.all([
    getPublicStore(slug),
    getPublicProducts(slug),
    getPublicTheme(slug),
  ]);
  if (!store) notFound();
  return (
    <>
      <StoreAnalyticsTracker
        merchantId={store.merchantId}
        storeSlug={store.storeSlug}
      />
      <StoreView store={store} products={products} theme={theme} />
    </>
  );
}
