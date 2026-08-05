"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { formatCurrency } from "@/lib/format";
import { getProductImageUrl } from "@/lib/storage";

export default function CartPage() {
  const params = useParams<{ slug: string }>();
  const storeSlug = params.slug;
  const { items, setQuantity, removeProduct } = useCart();

  const storeItems = items.filter(
    (item) => item.storeSlug === storeSlug,
  );
  const total = storeItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const currency = storeItems[0]?.currency ?? "CAD";

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <div>
        <Link
          href={`/shop/${storeSlug}`}
          className="text-sm font-bold text-violet-700"
        >
          ← Continue shopping
        </Link>
        <h1 className="mt-3 text-4xl font-black text-slate-950">
          Your cart
        </h1>
      </div>

      {!storeItems.length ? (
        <section className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-2xl font-black text-slate-950">
            Your cart is empty
          </h2>
          <Link
            href={`/shop/${storeSlug}`}
            className="mt-6 inline-flex rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white"
          >
            Browse products
          </Link>
        </section>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          <section className="space-y-4">
            {storeItems.map((item) => (
              <article
                key={item.productId}
                className="flex gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                {item.imagePath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getProductImageUrl(item.imagePath)}
                    alt={item.title}
                    className="h-24 w-24 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-2xl bg-slate-100" />
                )}

                <div className="min-w-0 flex-1">
                  <h2 className="font-black text-slate-950">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-slate-600">
                    {formatCurrency(item.price, item.currency)}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(item.productId, item.quantity - 1)
                      }
                      className="h-9 w-9 rounded-full border border-slate-300 font-black"
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center font-black">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(item.productId, item.quantity + 1)
                      }
                      className="h-9 w-9 rounded-full border border-slate-300 font-black"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeProduct(item.productId)}
                      className="ml-auto text-sm font-bold text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">
              Order summary
            </h2>
            <div className="mt-5 flex justify-between border-t border-slate-200 pt-5 text-lg font-black">
              <span>Total</span>
              <span>{formatCurrency(total, currency)}</span>
            </div>
            <button
              type="button"
              disabled
              className="mt-6 w-full cursor-not-allowed rounded-2xl bg-slate-300 px-5 py-3 font-bold text-slate-600"
            >
              Checkout coming next
            </button>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Secure server-side order creation and payment will be
              added in the checkout phase.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
