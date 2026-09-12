import Link from "next/link";
import { redirect } from "next/navigation";

export default function HomePage() {
  const defaultSlug = process.env.NEXT_PUBLIC_DEFAULT_STORE_SLUG?.trim();

  if (defaultSlug) {
    redirect(`/shop/${defaultSlug}`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-20">
      <section className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-xl md:p-12">
        <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-violet-700">
          ShopPilot
        </p>
        <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
          Your next storefront starts here.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Create a look that feels like your brand. Preview your design, save a
          draft, and publish it to your ShopPilot store.
        </p>
        <Link
          href="/customize"
          className="mt-8 inline-flex rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white"
        >
          Open store designer
        </Link>
      </section>
    </main>
  );
}
