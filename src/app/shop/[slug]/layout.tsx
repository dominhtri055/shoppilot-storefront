import { StoreSurface } from "@/components/StoreSurface";
import { getPublicTheme } from "@/lib/theme-api";
export default async function ShopLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <StoreSurface theme={await getPublicTheme(slug)}>{children}</StoreSurface>
  );
}
