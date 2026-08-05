import Link from "next/link";
import { getProductImageUrl } from "@/lib/storage";
import { formatCurrency } from "@/lib/format";
import type { PublicProduct } from "@/types/storefront";

type Props = {
  storeSlug: string;
  currency: string;
  product: PublicProduct;
};

export function ProductCard({
  storeSlug,
  currency,
  product,
}: Props) {
  return (
    <Link
      href={`/shop/${storeSlug}/products/${product.id}`}
      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      {product.imagePath ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={getProductImageUrl(product.imagePath)}
          alt={product.title}
          className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex aspect-square items-center justify-center bg-slate-100 text-sm font-semibold text-slate-400">
          No product image
        </div>
      )}

      <div className="space-y-2 p-5">
        <p className="text-sm font-semibold text-violet-700">
          {product.vendor}
        </p>
        <h2 className="text-xl font-black text-slate-950">
          {product.title}
        </h2>
        <div className="flex items-center justify-between gap-4">
          <p className="font-black text-slate-950">
            {formatCurrency(product.price, currency)}
          </p>
          <p className="text-sm text-slate-500">
            {product.inventory} available
          </p>
        </div>
      </div>
    </Link>
  );
}
