"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export function CartButton({ storeSlug }: { storeSlug: string }) {
  const { itemCount } = useCart();

  return (
    <Link
      href={`/shop/${storeSlug}/cart`}
      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-sm transition hover:border-slate-900"
    >
      Cart ({itemCount})
    </Link>
  );
}
