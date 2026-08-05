export default function Loading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-10">
      <div className="h-20 animate-pulse rounded-3xl bg-slate-200" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="aspect-square animate-pulse rounded-3xl bg-slate-200"
          />
        ))}
      </div>
    </main>
  );
}
