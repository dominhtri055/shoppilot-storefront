import { CartButton } from "./CartButton";
import { ProductCard } from "./ProductCard";
import { getStoreLogoUrl } from "@/lib/storage";
import type { PublicProduct, PublicStore } from "@/types/storefront";
import type { StoreTheme } from "@/lib/store-theme";
export function StoreView({
  store,
  products,
  theme,
  preview = false,
}: {
  store: PublicStore;
  products: PublicProduct[];
  theme: StoreTheme;
  preview?: boolean;
}) {
  return (
    <>
      {theme.announcement && (
        <div className="store-announcement">{theme.announcement}</div>
      )}
      <header className="store-header">
        <a
          href={preview ? "#" : `/shop/${store.storeSlug}`}
          className="store-brand"
        >
          {store.logoPath ? (
            <img
              src={getStoreLogoUrl(store.logoPath)}
              alt=""
              width={38}
              height={38}
            />
          ) : (
            <span className="store-monogram">{store.storeName.charAt(0)}</span>
          )}
          {store.storeName}
        </a>
        <nav aria-label="Store navigation">
          <a href="#collection">Collection</a>
          {theme.showAbout && <a href="#about">Our story</a>}
          {preview ? (
            <span className="preview-cart">Cart (0)</span>
          ) : (
            <CartButton storeSlug={store.storeSlug} />
          )}
        </nav>
      </header>
      <main className="store-content">
        {theme.sections.map((section) => {
          if (section === "hero")
            return (
              theme.showHero && (
                <section
                  key={section}
                  className={`store-hero ${theme.layout} ${theme.banner ? "with-image" : ""}`}
                >
                  <div>
                    <p className="store-eyebrow">
                      Welcome to {store.storeName}
                    </p>
                    <h1>{theme.heading || store.storeName}</h1>
                    <p className="store-description">
                      {theme.description ||
                        store.description ||
                        "Find your next favorite. Explore our collection."}
                    </p>
                    <a className="store-cta" href="#collection">
                      Explore collection <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                  {theme.banner && (
                    <img
                      className="store-banner"
                      src={theme.banner}
                      alt="Store collection"
                    />
                  )}
                </section>
              )
            );
          if (section === "about")
            return (
              theme.showAbout && (
                <section key={section} id="about" className="store-about">
                  <p className="store-eyebrow">A little about us</p>
                  <h2>Our story</h2>
                  <p>{theme.about || store.description}</p>
                </section>
              )
            );
          return (
            <section key={section} id="collection" className="store-collection">
              <div className="collection-title">
                <h2>The collection</h2>
                <span>{products.length} products</span>
              </div>
              {products.length ? (
                <div className="store-product-grid">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      storeSlug={store.storeSlug}
                      currency={store.currency}
                      product={product}
                      showInventory={theme.showInventory}
                    />
                  ))}
                </div>
              ) : (
                <div className="store-empty">
                  <h3>Something good is on its way.</h3>
                  <p>Check back soon for new products.</p>
                </div>
              )}
            </section>
          );
        })}
      </main>
      <footer className="store-footer">
        <strong>{store.storeName}</strong>
        {store.businessEmail && (
          <a href={`mailto:${store.businessEmail}`}>Get in touch</a>
        )}
        <a href="/customize">Customize your store</a>
        <span>Powered by ShopPilot</span>
      </footer>
    </>
  );
}
