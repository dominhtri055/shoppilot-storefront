import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { CartButton } from "@/components/CartButton";
import { StoreAnalyticsTracker } from "@/components/StoreAnalyticsTracker";
import {
  getPublicProduct,
  getPublicStore,
} from "@/lib/storefront-api";
import { formatCurrency } from "@/lib/format";
import { getProductImageUrl } from "@/lib/storage";

type Props = {
  params: Promise<{
    slug: string;
    productId: string;
  }>;
};

export default async function ProductPage({ params }: Props) {
  const { slug, productId } = await params;
  const [store, product] = await Promise.all([
    getPublicStore(slug),
    getPublicProduct(slug, productId),
  ]);

  if (!store || !product) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <StoreAnalyticsTracker
        merchantId={store.merchantId}
        storeSlug={store.storeSlug}
        productId={product.id}
      />

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-6 py-5">
          <Link
            href={`/shop/${store.storeSlug}`}
            className="font-black text-slate-950"
          >
            ← {store.storeName}
          </Link>
          <CartButton storeSlug={store.storeSlug} />
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
          {product.imagePath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getProductImageUrl(product.imagePath)}
              alt={product.title}
              className="aspect-square w-full object-cover"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center bg-slate-100 font-semibold text-slate-400">
              No product image
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-sm font-black uppercase tracking-[0.15em] text-violet-700">
            {product.vendor}
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
            {product.title}
          </h1>
          <p className="mt-6 text-3xl font-black text-slate-950">
            {formatCurrency(product.price, store.currency)}
          </p>
          <p className="mt-3 text-slate-500">
            {product.inventory} available
          </p>

          {product.tags.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-violet-100 px-3 py-1 text-sm font-bold text-violet-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-10 max-w-md">
            <AddToCartButton
              storeSlug={store.storeSlug}
              currency={store.currency}
              product={product}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
