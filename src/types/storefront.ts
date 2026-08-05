export type PublicStore = {
  merchantId: string;
  storeSlug: string;
  storeName: string;
  businessEmail: string;
  description: string;
  currency: string;
  logoPath: string | null;
};

export type PublicProduct = {
  id: string;
  merchantId: string;
  title: string;
  vendor: string;
  price: number;
  inventory: number;
  tags: string[];
  imagePath: string | null;
  updatedAt: string;
};

export type CartItem = {
  productId: string;
  storeSlug: string;
  merchantId: string;
  title: string;
  price: number;
  currency: string;
  imagePath: string | null;
  quantity: number;
  inventory: number;
};
