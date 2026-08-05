"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import type { PublicProduct } from "@/types/storefront";

type Props = {
  storeSlug: string;
  currency: string;
  product: PublicProduct;
};

export function AddToCartButton({
  storeSlug,
  currency,
  product,
}: Props) {
  const { addProduct } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addProduct(storeSlug, currency, product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={product.inventory <= 0}
      className="w-full rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-400"
    >
      {added ? "Added to cart" : "Add to cart"}
    </button>
  );
}
