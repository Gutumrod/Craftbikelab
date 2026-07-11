export default function TripLoading() {
  return (
    <main className="min-h-screen bg-[#0e0e0e] px-4 pb-20 pt-28 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-3xl">
          <div className="mb-5 h-9 w-32 animate-pulse rounded-lg bg-white/10" />
          <div className="mb-4 h-14 w-full max-w-xl animate-pulse rounded-lg bg-white/10 md:h-20" />
          <div className="h-7 w-full max-w-md animate-pulse rounded-lg bg-white/10" />
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-9 w-24 animate-pulse rounded-full bg-white/10" />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="overflow-hidden rounded-xl bg-[#131313]">
              <div className="h-40 animate-pulse bg-white/10 md:h-56" />
              <div className="space-y-3 p-3 md:p-5">
                <div className="h-4 w-20 animate-pulse rounded bg-white/10" />
                <div className="h-5 w-full animate-pulse rounded bg-white/10" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-white/10" />
                <div className="h-9 w-full animate-pulse rounded-lg bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
