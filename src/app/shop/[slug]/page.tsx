import { notFound } from "next/navigation";
import { CartButton } from "@/components/CartButton";
import { ProductCard } from "@/components/ProductCard";
import { StoreAnalyticsTracker } from "@/components/StoreAnalyticsTracker";
import {
  getPublicProducts,
  getPublicStore,
} from "@/lib/storefront-api";
import { getStoreLogoUrl } from "@/lib/storage";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function StorePage({ params }: Props) {
  const { slug } = await params;
  const [store, products] = await Promise.all([
    getPublicStore(slug),
    getPublicProducts(slug),
  ]);

  if (!store) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <StoreAnalyticsTracker
        merchantId={store.merchantId}
        storeSlug={store.storeSlug}
      />

      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-6 py-5">
          <div className="flex min-w-0 items-center gap-4">
            {store.logoPath ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getStoreLogoUrl(store.logoPath)}
                alt={`${store.storeName} logo`}
                className="h-14 w-14 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-700 text-2xl font-black text-white">
                {store.storeName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-xl font-black text-slate-950">
                {store.storeName}
              </p>
              <p className="truncate text-sm text-slate-500">
                {store.businessEmail}
              </p>
            </div>
          </div>

          <CartButton storeSlug={store.storeSlug} />
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="max-w-3xl">
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
            {store.storeName}
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            {store.description ||
              "Browse our latest products and find something you love."}
          </p>
        </div>

        {products.length ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                storeSlug={store.storeSlug}
                currency={store.currency}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-2xl font-black text-slate-950">
              No products available
            </h2>
            <p className="mt-3 text-slate-600">
              This store has no active in-stock products right now.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
