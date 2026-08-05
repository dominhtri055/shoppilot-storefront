"use client";

import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem, PublicProduct } from "@/types/storefront";
import { trackStoreEvent } from "@/lib/analytics";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  addProduct: (
    storeSlug: string,
    currency: string,
    product: PublicProduct,
  ) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeProduct: (productId: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "shoppilot-storefront-cart";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [hydrated, items]);

  const addProduct = useCallback(
    (storeSlug: string, currency: string, product: PublicProduct) => {
      setItems((current) => {
        const sameStore = current.filter(
          (item) => item.storeSlug === storeSlug,
        );
        const existing = sameStore.find(
          (item) => item.productId === product.id,
        );

        if (existing) {
          return sameStore.map((item) =>
            item.productId === product.id
              ? {
                  ...item,
                  quantity: Math.min(
                    item.quantity + 1,
                    product.inventory,
                  ),
                }
              : item,
          );
        }

        return [
          ...sameStore,
          {
            productId: product.id,
            storeSlug,
            merchantId: product.merchantId,
            title: product.title,
            price: product.price,
            currency,
            imagePath: product.imagePath,
            quantity: 1,
            inventory: product.inventory,
          },
        ];
      });

      void trackStoreEvent({
        merchantId: product.merchantId,
        productId: product.id,
        eventType: "product_added_to_cart",
        metadata: { storeSlug },
      });
    },
    [],
  );

  const setQuantity = useCallback(
    (productId: string, quantity: number) => {
      setItems((current) =>
        current
          .map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  quantity: Math.max(
                    0,
                    Math.min(quantity, item.inventory),
                  ),
                }
              : item,
          )
          .filter((item) => item.quantity > 0),
      );
    },
    [],
  );

  const removeProduct = useCallback((productId: string) => {
    setItems((current) =>
      current.filter((item) => item.productId !== productId),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: items.reduce(
        (total, item) => total + item.quantity,
        0,
      ),
      addProduct,
      setQuantity,
      removeProduct,
      clear,
    }),
    [addProduct, clear, items, removeProduct, setQuantity],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return context;
}
