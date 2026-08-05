import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-20">
      <section className="w-full rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-violet-700">
          404
        </p>
        <h1 className="mt-3 text-4xl font-black text-slate-950">
          Store or product unavailable
        </h1>
        <p className="mt-4 text-slate-600">
          It may be unpublished, out of stock, or no longer available.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white"
        >
          Return home
        </Link>
      </section>
    </main>
  );
}
