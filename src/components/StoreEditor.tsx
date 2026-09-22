"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { StoreView } from "./StoreView";
import { StoreSurface } from "./StoreSurface";
import {
  defaultTheme,
  isValidBanner,
  normalizeTheme,
  presets,
  type StoreTheme,
} from "@/lib/store-theme";
import { getSupabasePublicConfig } from "@/lib/supabase";
import type { PublicProduct, PublicStore } from "@/types/storefront";

const demoStore: PublicStore = {
  merchantId: "demo",
  storeSlug: "demo",
  storeName: "Your studio",
  businessEmail: "",
  description: "Everyday essentials. Thoughtfully selected.",
  currency: "CAD",
  logoPath: null,
};
const demoProducts: PublicProduct[] = [
  "Everyday tote",
  "Studio notebook",
  "Weekend cap",
].map((title, i) => ({
  id: `demo-${i}`,
  merchantId: "demo",
  title,
  vendor: "Your collection",
  price: [28, 18, 32][i],
  inventory: 12,
  tags: [],
  imagePath: null,
  updatedAt: "",
}));
const demoTheme = {
  ...defaultTheme,
  heading: "Make it yours.",
  description:
    "A collection with a point of view. A storefront that feels like you.",
  announcement: "A fresh perspective on everyday essentials.",
};
type Session = { token: string; id: string };
async function request(path: string, token: string, init: RequestInit = {}) {
  const { url, publishableKey } = getSupabasePublicConfig();
  const response = await fetch(`${url}${path}`, {
    ...init,
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${token || publishableKey}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401)
      throw new Error("Your session has expired. Sign out and sign in again.");
    if (response.status === 404 || payload?.code === "PGRST205")
      throw new Error(
        "Store customization is not enabled yet. Ask your administrator to apply the storefront customization migration.",
      );
    throw new Error(
      payload?.error_description ||
        payload?.msg ||
        payload?.message ||
        "Could not save your changes. Please try again.",
    );
  }
  return payload;
}
export function StoreEditor() {
  const [theme, setTheme] = useState<StoreTheme>(demoTheme);
  const [store, setStore] = useState(demoStore);
  const [products, setProducts] = useState(demoProducts);
  const [session, setSession] = useState<Session | null>(null);
  const [demo, setDemo] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [tab, setTab] = useState("Design");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [published, setPublished] = useState<StoreTheme | null>(null);
  const [storePublished, setStorePublished] = useState(false);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function update<K extends keyof StoreTheme>(key: K, value: StoreTheme[K]) {
    setTheme((t) => ({ ...t, [key]: value }));
    setDirty(true);
    setMessage("");
  }
  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const auth = await request("/auth/v1/token?grant_type=password", "", {
        method: "POST",
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const nextSession = {
        token: auth.access_token as string,
        id: auth.user.id as string,
      };
      const rows = await request(
        `/rest/v1/profiles?id=eq.${encodeURIComponent(nextSession.id)}&select=id,store_slug,store_name,business_email,store_description,currency,logo_path,is_store_published`,
        nextSession.token,
      );
      const p = rows[0];
      if (!p) throw new Error("No merchant profile found for this account.");
      const [themes, items] = await Promise.all([
        request(
          `/rest/v1/storefront_themes?merchant_id=eq.${encodeURIComponent(nextSession.id)}&select=draft,published`,
          nextSession.token,
        ),
        // Owner RLS allows a private store to be designed before publication.
        request(
          `/rest/v1/products?merchant_id=eq.${encodeURIComponent(nextSession.id)}&status=eq.active&inventory=gt.0&select=id,merchant_id,title,vendor,price,inventory,tags,image_path,updated_at&order=updated_at.desc`,
          nextSession.token,
        ),
      ]);
      setStore({
        merchantId: p.id,
        storeSlug: p.store_slug,
        storeName: p.store_name,
        businessEmail: p.business_email || "",
        description: p.store_description || "",
        currency: p.currency,
        logoPath: p.logo_path,
      });
      setProducts(
        items.map((x: Record<string, unknown>) => ({
          id: x.id,
          merchantId: x.merchant_id,
          title: x.title,
          vendor: x.vendor,
          price: Number(x.price),
          inventory: x.inventory,
          tags: x.tags || [],
          imagePath: x.image_path,
          updatedAt: x.updated_at,
        })),
      );
      setTheme(normalizeTheme(themes[0]?.draft));
      setPublished(
        themes[0]?.published ? normalizeTheme(themes[0].published) : null,
      );
      setSession(nextSession);
      setDemo(false);
      setDirty(false);
      setStorePublished(p.is_store_published);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }
  async function save(publish: boolean) {
    if (!isValidBanner(theme.banner)) {
      setMessage(
        "Enter a valid HTTPS banner URL or leave it empty before saving.",
      );
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const clean = normalizeTheme(theme);
      if (demo) {
        localStorage.setItem("shoppilot-designer-demo", JSON.stringify(clean));
        setMessage("Demo saved on this device. No live store was changed.");
      } else if (session) {
        await request(
          "/rest/v1/storefront_themes?on_conflict=merchant_id",
          session.token,
          {
            method: "POST",
            headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
            body: JSON.stringify({
              merchant_id: session.id,
              draft: clean,
              ...(publish ? { published: clean } : {}),
              updated_at: new Date().toISOString(),
            }),
          },
        );
        if (publish) setPublished(clean);
        setMessage(
          publish
            ? storePublished
              ? "Published. Your storefront now uses this design."
              : "Design published. Enable your store in ShopPilot Mobile to make it visible to customers."
            : "Draft saved. Your published design is unchanged.",
        );
      }
      setTheme(clean);
      setDirty(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }
  function startDemo() {
    setDemo(true);
    setMessage("");
    try {
      const saved = localStorage.getItem("shoppilot-designer-demo");
      if (saved) setTheme(normalizeTheme(JSON.parse(saved)));
    } catch {
      setMessage(
        "Device storage is unavailable. You can still preview changes.",
      );
    }
  }
  function leave() {
    if (dirty && !window.confirm("Discard unsaved changes and sign out?"))
      return;
    setSession(null);
    setDemo(false);
    setTheme(demoTheme);
    setStore(demoStore);
    setProducts(demoProducts);
    setPublished(null);
    setDirty(false);
    setMessage("");
  }
  function move(index: number, direction: number) {
    const sections = [...theme.sections];
    [sections[index], sections[index + direction]] = [
      sections[index + direction],
      sections[index],
    ];
    update("sections", sections);
  }
  const textField = (
    key: "announcement" | "heading" | "description" | "banner" | "about",
    label: string,
    limit: number,
  ) => (
    <label>
      {label}
      {key === "description" || key === "about" ? (
        <textarea
          maxLength={limit}
          value={theme[key]}
          onChange={(e) => update(key, e.target.value)}
        />
      ) : (
        <input
          type={key === "banner" ? "url" : "text"}
          maxLength={limit}
          placeholder={key === "banner" ? "https://…" : ""}
          value={theme[key]}
          onChange={(e) => update(key, e.target.value)}
        />
      )}
    </label>
  );
  return (
    <div className="designer">
      <header className="designer-top">
        <Link
          href="/"
          className="designer-logo"
          onClick={(event) => {
            if (
              busy ||
              (dirty && !window.confirm("Leave without saving your design?"))
            )
              event.preventDefault();
          }}
        >
          ◈ <span>ShopPilot</span>
        </Link>
        <span className="designer-divider">/</span>
        <strong>Store designer</strong>
        <span className="designer-status">
          {demo ? "Demo" : session ? store.storeName : "Preview"}
          {dirty ? " · Unsaved changes" : ""}
        </span>
        {(session || demo) && (
          <div className="designer-actions">
            <button disabled={busy} onClick={leave}>
              {demo ? "Exit demo" : "Sign out"}
            </button>
            <button disabled={busy} onClick={() => save(false)}>
              Save draft
            </button>
            <button
              className="primary"
              disabled={busy || demo}
              onClick={() => save(true)}
            >
              {busy ? "Saving…" : "Publish design"}
            </button>
          </div>
        )}
      </header>
      {message && (
        <div role="status" className="designer-message">
          {message}
        </div>
      )}
      <div className="designer-workspace">
        <aside className="designer-sidebar">
          {!session && !demo ? (
            <form onSubmit={signIn} className="designer-login">
              <p className="editor-kicker">YOUR STORE, YOUR WAY</p>
              <h1>A space for your brand.</h1>
              <p>
                Sign in with your ShopPilot merchant account to edit and publish
                your storefront.
              </p>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                />
              </label>
              <label>
                Password
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </label>
              <button className="primary" disabled={busy}>
                {busy ? "Signing in…" : "Sign in"}
              </button>
              <button type="button" onClick={startDemo}>
                Try the demo
              </button>
              <p className="editor-help">
                Demo changes are saved only on this device.
              </p>
            </form>
          ) : (
            <>
              <div
                className="editor-tabs"
                role="tablist"
                aria-label="Editor panels"
              >
                {["Design", "Content", "Layout"].map((name) => (
                  <button
                    key={name}
                    role="tab"
                    id={`tab-${name}`}
                    aria-controls="editor-panel"
                    aria-selected={tab === name}
                    tabIndex={tab === name ? 0 : -1}
                    onKeyDown={(e) => {
                      const names = ["Design", "Content", "Layout"];
                      const index = names.indexOf(name);
                      const next =
                        e.key === "ArrowRight"
                          ? (index + 1) % 3
                          : e.key === "ArrowLeft"
                            ? (index + 2) % 3
                            : e.key === "Home"
                              ? 0
                              : e.key === "End"
                                ? 2
                                : -1;
                      if (next >= 0) {
                        e.preventDefault();
                        setTab(names[next]);
                        document.getElementById(`tab-${names[next]}`)?.focus();
                      }
                    }}
                    onClick={() => setTab(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <fieldset
                disabled={busy}
                className="editor-panel"
                id="editor-panel"
                role="tabpanel"
                aria-labelledby={`tab-${tab}`}
              >
                {tab === "Design" && (
                  <>
                    <h2>Start with a look</h2>
                    <p className="editor-help">
                      Keep your content. Change the mood.
                    </p>
                    <div className="preset-list">
                      {Object.entries(presets).map(([name, preset]) => (
                        <button
                          key={name}
                          onClick={() => {
                            setTheme((t) => ({ ...t, ...preset }));
                            setDirty(true);
                          }}
                        >
                          <span style={{ background: preset.accent }} />
                          {name}
                          <span className="preset-type">Aa</span>
                        </button>
                      ))}
                    </div>
                    <h2>Brand details</h2>
                    <label>
                      Brand color
                      <div className="color-field">
                        <input
                          type="color"
                          value={theme.accent}
                          onChange={(e) => update("accent", e.target.value)}
                        />
                        <span>{theme.accent.toUpperCase()}</span>
                      </div>
                    </label>
                    <label>
                      Page background
                      <div className="color-field">
                        <input
                          type="color"
                          value={theme.background}
                          onChange={(e) => update("background", e.target.value)}
                        />
                        <span>{theme.background.toUpperCase()}</span>
                      </div>
                    </label>
                    <label>
                      Typography
                      <select
                        value={theme.font}
                        onChange={(e) =>
                          update("font", e.target.value as StoreTheme["font"])
                        }
                      >
                        <option value="sans">Modern sans</option>
                        <option value="serif">Editorial serif</option>
                      </select>
                    </label>
                    <label>
                      Card corners
                      <select
                        value={theme.corners}
                        onChange={(e) =>
                          update(
                            "corners",
                            e.target.value as StoreTheme["corners"],
                          )
                        }
                      >
                        <option value="soft">Soft</option>
                        <option value="square">Square</option>
                      </select>
                    </label>
                  </>
                )}
                {tab === "Content" && (
                  <>
                    <h2>Tell your story</h2>
                    {textField("announcement", "Announcement bar", 160)}
                    {textField("heading", "Hero headline", 120)}
                    {textField("description", "Hero description", 500)}
                    {textField("banner", "Banner image URL (HTTPS)", 2048)}
                    {!isValidBanner(theme.banner) && (
                      <p className="editor-help">
                        Use an HTTPS image URL before saving.
                      </p>
                    )}
                    {textField("about", "Our story", 2000)}
                    <p className="editor-help">
                      Store name, logo and products are managed in ShopPilot
                      Mobile.
                    </p>
                  </>
                )}
                {tab === "Layout" && (
                  <>
                    <h2>Make room for what matters</h2>
                    <label>
                      Hero layout
                      <select
                        value={theme.layout}
                        onChange={(e) =>
                          update(
                            "layout",
                            e.target.value as StoreTheme["layout"],
                          )
                        }
                      >
                        <option value="split">Split</option>
                        <option value="centered">Centered</option>
                      </select>
                    </label>
                    <label>
                      Desktop product columns
                      <select
                        value={theme.columns}
                        onChange={(e) =>
                          update(
                            "columns",
                            Number(e.target.value) as StoreTheme["columns"],
                          )
                        }
                      >
                        {[2, 3, 4].map((n) => (
                          <option key={n}>{n}</option>
                        ))}
                      </select>
                    </label>
                    <h2>Sections</h2>
                    {theme.sections.map((section, i) => (
                      <div className="section-row" key={section}>
                        <span>
                          {section === "hero"
                            ? "Hero banner"
                            : section === "products"
                              ? "Collection"
                              : "Our story"}
                        </span>
                        <button
                          aria-label={`Move ${section} up`}
                          disabled={i === 0}
                          onClick={() => move(i, -1)}
                        >
                          ↑
                        </button>
                        <button
                          aria-label={`Move ${section} down`}
                          disabled={i === 2}
                          onClick={() => move(i, 1)}
                        >
                          ↓
                        </button>
                      </div>
                    ))}
                    {(["showHero", "showAbout", "showInventory"] as const).map(
                      (key, i) => (
                        <label className="check-field" key={key}>
                          <input
                            type="checkbox"
                            checked={theme[key]}
                            onChange={(e) => update(key, e.target.checked)}
                          />
                          {
                            [
                              "Show hero banner",
                              "Show our story",
                              "Show stock counts",
                            ][i]
                          }
                        </label>
                      ),
                    )}
                  </>
                )}
                <div className="editor-reset">
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Replace your draft with the default design?",
                        )
                      ) {
                        setTheme(defaultTheme);
                        setDirty(true);
                      }
                    }}
                  >
                    Reset design
                  </button>
                  {published && (
                    <button
                      onClick={() => {
                        if (
                          !dirty ||
                          window.confirm(
                            "Discard changes and restore the published design?",
                          )
                        ) {
                          setTheme(published);
                          setDirty(true);
                        }
                      }}
                    >
                      Restore published
                    </button>
                  )}
                </div>
              </fieldset>
            </>
          )}
        </aside>
        <section className="designer-preview" aria-label="Storefront preview">
          <div className="preview-toolbar">
            <span>LIVE PREVIEW</span>
            <div>
              <button aria-pressed={!mobile} onClick={() => setMobile(false)}>
                Desktop
              </button>
              <button aria-pressed={mobile} onClick={() => setMobile(true)}>
                Mobile
              </button>
            </div>
            {session && storePublished && (
              <a
                href={`/shop/${store.storeSlug}`}
                target="_blank"
                rel="noreferrer"
              >
                View store ↗
              </a>
            )}
          </div>
          <div
            className={`preview-frame ${mobile ? "mobile" : ""}`}
            onClick={(e) => {
              const a = (e.target as HTMLElement).closest("a");
              if (a) {
                e.preventDefault();
                const href = a.getAttribute("href");
                if (href?.startsWith("#") && href.length > 1)
                  e.currentTarget
                    .querySelector(href)
                    ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
              }
            }}
          >
            <StoreSurface theme={normalizeTheme(theme)}>
              <StoreView
                store={store}
                products={products}
                theme={normalizeTheme(theme)}
                preview
              />
            </StoreSurface>
          </div>
          <p className="preview-note">
            {demo || !session
              ? "Sample products · Demo preview"
              : "Your active, in-stock products appear here, even before your store is public."}
          </p>
        </section>
      </div>
    </div>
  );
}
