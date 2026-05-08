import Link from "next/link";
import {
  featuredStories,
  miniRoutes,
  newsExtras,
  routeCards,
  shopHighlights,
  shopMiniCards,
} from "@/lib/home-content";

function ReadMore() {
  return (
    <span className="inline-flex items-center gap-2 font-headline text-xs font-bold uppercase tracking-widest text-[#69daff] transition-colors group-hover:text-white">
      อ่านต่อ <span className="material-symbols-outlined text-sm">east</span>
    </span>
  );
}

export default function HighlightsSection() {
  return (
    <>
      <section className="reveal mx-auto max-w-[1440px] px-4 py-8 md:px-8 md:py-12">
        <div className="mb-6 flex items-center justify-between md:mb-8">
          <h2 className="font-headline text-2xl font-black uppercase tracking-tighter text-white md:text-3xl">
            ข่าวสารและกิจกรรม
          </h2>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2 md:gap-8">
          {featuredStories.map((story, index) => (
            <Link
              key={story.title}
              href={story.href}
              className="group flex flex-col overflow-hidden rounded-xl bg-[#131313] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.8)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(105,218,255,0.18)] md:flex-row"
            >
              <div className="relative flex h-48 items-center justify-center overflow-hidden md:h-auto md:w-2/5">
                <div className="absolute inset-0 bg-gradient-to-br from-[#131313] to-[#262626] transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-white/20">
                    {index === 0 ? "newspaper" : "event"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col p-5 md:w-3/5">
                <span className="mb-2 font-headline text-xs font-bold uppercase tracking-widest text-[#69daff]">
                  {story.eyebrow}
                </span>
                <h3 className="mb-2 font-headline text-lg font-bold text-white transition-colors group-hover:text-[#69daff] md:text-xl">
                  {story.title}
                </h3>
                <p className="mb-3 line-clamp-2 text-sm leading-7 text-white/60">
                  {story.description}
                </p>
                <div className="mt-auto">
                  <ReadMore />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {newsExtras.map((card) => {
            const iconName =
              card.icon === "spark" ? "new_releases" : card.icon === "route" ? "route" : "engineering";
            return (
              <Link
                key={card.title}
                href={card.href}
                className="group flex flex-col overflow-hidden rounded-xl bg-[#131313] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.8)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(105,218,255,0.12)]"
              >
                <div className="relative h-40 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#131313] to-[#262626] transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-white/20">
                      {iconName}
                    </span>
                  </div>
                </div>
                <div className="flex flex-grow flex-col p-4">
                  <span className="mb-2 font-headline text-[10px] font-bold uppercase tracking-widest text-[#69daff]">
                    {card.eyebrow}
                  </span>
                  <h3 className="mb-2 font-headline text-base font-bold text-white transition-colors group-hover:text-[#69daff]">
                    {card.title}
                  </h3>
                  <p className="mt-auto text-xs leading-6 text-white/50">
                    {card.description}
                  </p>
                  <div className="mt-3">
                    <ReadMore />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center md:mt-10">
          <Link
            href="/news"
            className="kinetic-gradient-primary rounded-lg px-6 py-2 text-sm font-black uppercase tracking-tighter text-black shadow-[0_0_24px_rgba(105,218,255,0.3)] transition-transform hover:scale-105 active:scale-95 md:px-8 md:py-3 md:text-base"
          >
            อ่านข่าวทั้งหมด
          </Link>
        </div>
      </section>

      <section className="reveal bg-[#0e0e0e]/50 py-16 md:py-24">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8">
          <div className="mb-8 flex items-end gap-4 md:mb-12">
            <h2 className="font-headline text-2xl font-black uppercase tracking-tighter text-white text-glow-primary md:text-3xl">
              Top Rated Gear
            </h2>
            <div className="mb-2 h-[2px] flex-1 bg-gradient-to-r from-[#69daff] to-transparent opacity-40" />
          </div>

          <div className="mb-10 grid gap-6 md:grid-cols-3 md:gap-8 md:mb-12">
            {shopHighlights.map((item) => {
              const iconName =
                item.icon === "exhaust"
                  ? "manufacturing"
                  : item.icon === "brake"
                    ? "tune"
                    : "settings";
              return (
                <article
                  key={item.title}
                  className="group overflow-hidden rounded-xl bg-[#131313] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.8)] transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden md:h-56">
                    <img
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={item.image}
                      alt={item.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/0 via-black/15 to-black/45" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-6xl text-white/20">
                        {iconName}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 md:p-6">
                    <h3 className="font-headline text-xl font-bold text-white transition-colors group-hover:text-[#69daff] md:text-2xl">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs leading-6 text-white/50 md:text-sm">
                      {item.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-headline text-xl font-black text-white md:text-2xl">
                        {item.price}
                      </span>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1a1a] text-white transition-colors hover:bg-[#69daff] hover:text-black md:h-10 md:w-10"
                        aria-label={`Open ${item.title}`}
                      >
                        <span
                          className="material-symbols-outlined text-base md:text-xl"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          arrow_forward
                        </span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-6">
            {shopMiniCards.map((item) => (
              <div
                key={item.title}
                className="group overflow-hidden rounded-lg border border-[#484847]/20 bg-[#131313]"
              >
                <div className="flex h-32 items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#262626]">
                  <span className="material-symbols-outlined text-4xl text-white/20">
                    {item.icon}
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="font-headline text-sm font-bold text-white transition-colors group-hover:text-[#69daff]">
                    {item.title}
                  </h3>
                  <p className="font-body text-xs text-white/50">{item.price}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/shop"
              className="kinetic-gradient-primary rounded-lg px-6 py-2 text-sm font-black uppercase tracking-tighter text-black shadow-[0_0_24px_rgba(105,218,255,0.3)] transition-transform hover:scale-105 active:scale-95 md:px-8 md:py-3 md:text-base"
            >
              ดูสินค้าทั้งหมด
            </Link>
          </div>
        </div>
      </section>

      <section className="reveal py-16 md:py-24">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8">
          <div className="mb-8 flex items-end gap-4 md:mb-12">
            <h2 className="font-headline text-2xl font-black uppercase tracking-tighter text-white text-glow-primary md:text-3xl">
              Popular Routes
            </h2>
            <div className="mb-2 h-[2px] flex-1 bg-gradient-to-r from-[#69daff] to-transparent opacity-40" />
          </div>

          <div className="mb-10 grid gap-6 md:grid-cols-3 md:gap-8 md:mb-12">
            {routeCards.map((route) => (
              <article
                key={route.title}
                className="group overflow-hidden rounded-xl bg-[#131313] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.8)] transition-all hover:-translate-y-2"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    src={route.image}
                    alt={route.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/0 via-black/15 to-black/45" />
                  <div className="absolute left-4 top-4 rounded bg-black/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#69daff] backdrop-blur">
                    {route.region}
                  </div>
                </div>
                <div className="p-4 md:p-6">
                  <h3 className="mb-2 font-headline text-lg font-bold uppercase text-white transition-colors group-hover:text-[#69daff] md:text-xl">
                    {route.title}
                  </h3>
                  <p className="line-clamp-2 text-xs leading-6 text-white/50 md:text-sm">
                    {route.description}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-6">
            {miniRoutes.map((route) => (
              <div
                key={route.title}
                className="group overflow-hidden rounded-lg border border-[#484847]/20 bg-[#131313]"
              >
                <div className="relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#262626]">
                  <span className="material-symbols-outlined text-4xl text-white/20">
                    {route.icon}
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="font-headline text-sm font-bold text-white transition-colors group-hover:text-[#69daff]">
                    {route.title}
                  </h3>
                  <p className="font-body text-xs text-white/50">{route.region}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/trip"
              className="kinetic-gradient-primary inline-flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-black uppercase tracking-tighter text-black shadow-[0_0_24px_rgba(105,218,255,0.3)] transition-transform hover:scale-105 active:scale-95 md:px-8 md:py-3 md:text-base"
            >
              ดูเส้นทางทั้งหมด
              <span className="material-symbols-outlined text-base md:text-xl">chevron_right</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
