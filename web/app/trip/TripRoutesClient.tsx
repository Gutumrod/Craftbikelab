'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import SiteFooter from '@/components/site-footer';
import type { TripRegion, TripRoute, TripType } from '@/lib/trip-routes';
import { voteTripRoute } from './actions';

const LIKED_ROUTES_STORAGE_KEY = 'cbl_liked_routes';

function readLikedRoutes(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LIKED_ROUTES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is number => typeof id === 'number')
      : [];
  } catch {
    return [];
  }
}

function addLikedRoute(routeId: number): void {
  if (typeof window === 'undefined') return;
  try {
    const current = readLikedRoutes();
    if (current.includes(routeId)) return;
    window.localStorage.setItem(
      LIKED_ROUTES_STORAGE_KEY,
      JSON.stringify([...current, routeId]),
    );
  } catch {
    // ignore storage failures (private mode, quota, etc.)
  }
}

type RegionFilter = 'all' | TripRegion;
type TripTypeFilter = 'all' | 'day_trip' | 'weekend' | 'road_trip' | 'seasonal';

interface TripRoutesClientProps {
  routes: TripRoute[];
  initialError: string | null;
}

const REGION_OPTIONS: Array<{ id: RegionFilter; label: string }> = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'north', label: 'ภาคเหนือ' },
  { id: 'south', label: 'ภาคใต้' },
  { id: 'northeast', label: 'ภาคอีสาน' },
  { id: 'central', label: 'ภาคกลาง' },
];

const TRIP_TYPE_OPTIONS: Array<{ id: TripTypeFilter; label: string }> = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'day_trip', label: 'เดย์ทริป' },
  { id: 'weekend', label: 'วันหยุดสุดสัปดาห์' },
  { id: 'road_trip', label: 'โรดทริป 7 วัน' },
  { id: 'seasonal', label: 'ตามฤดูกาล' },
];

const INITIAL_VISIBLE_COUNT = 6;
const LOAD_MORE_COUNT = 4;

export default function TripRoutesClient({ routes, initialError }: TripRoutesClientProps) {
  const [selectedRegion, setSelectedRegion] = useState<RegionFilter>('all');
  const [selectedTripType, setSelectedTripType] = useState<TripTypeFilter>('all');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => {
      const matchRegion = selectedRegion === 'all' || route.region === selectedRegion;
      const matchTripType = selectedTripType === 'all' || route.trip_type === selectedTripType;
      return matchRegion && matchTripType;
    });
  }, [routes, selectedRegion, selectedTripType]);

  const visibleRoutes = filteredRoutes.slice(0, visibleCount);
  const topRoutes = routes.slice(0, 3);
  const hasMore = visibleCount < filteredRoutes.length;

  function handleRegionChange(region: RegionFilter) {
    setSelectedRegion(region);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }

  function handleTripTypeChange(type: TripTypeFilter) {
    setSelectedTripType(type);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      <TripHeader />

      <main className="min-h-screen pb-20 pt-24">
        <section className="relative overflow-hidden px-4 py-12 md:px-8 md:py-20">
          <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-20">
            <img
              className="h-full w-full object-cover grayscale"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3_ngBBQzGCxUujk54TmwSFIz2dKiLEjk0uyRVi5HSmsCxAVN9LGYzetWSi9av_psMbtfpD9fH9vSHwQiLacYbgh5opKJHKsg84SYW9yNtk2iW7Ec0PoEEVh4ngTXWACxxTUBpV9VRBZNvHPDtw0D02F2CXPcI0MX5uL3kx-sMgMq90pUcz4OvYg7FlwRqp4f42MfVyshhjUY8B3FceOtszZff5P7wRJzgIl88vrdqvUEaZRB_ydCfp5QBKt6crx-JHurPkZyts-Nj"
              alt=""
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0e0e0e]" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <h1 className="mb-2 font-headline text-4xl font-black italic leading-tight tracking-tighter text-white text-glow-primary md:text-[48px] md:leading-none lg:text-[64px]">
                TRIP FOR BIKE
              </h1>
              <p className="mb-8 max-w-xl text-xl font-medium tracking-wide text-[#69daff] md:mb-10 md:text-[24px]">
                ค้นพบเส้นทางสุดเร้าใจ ออกแบบทริปในฝันของคุณ
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#trip-routes"
                  className="flex items-center gap-2 rounded-lg bg-[#69daff] px-6 py-3 font-headline font-black italic uppercase tracking-tighter text-black shadow-[0_0_30px_rgba(105,218,255,0.4)] transition-transform duration-300 hover:scale-[1.02] active:scale-95 md:px-10 md:py-4"
                >
                  EXPLORE
                  <MaterialIcon name="explore" filled />
                </a>
                <a
                  href={visibleRoutes[0]?.maps_url ?? '#trip-routes'}
                  target={visibleRoutes[0]?.maps_url ? '_blank' : undefined}
                  rel={visibleRoutes[0]?.maps_url ? 'noreferrer' : undefined}
                  className="rounded-lg border border-white/20 bg-transparent px-6 py-3 font-headline font-black italic uppercase tracking-tighter text-white transition-colors hover:bg-white/5 md:px-10 md:py-4"
                >
                  View Map
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="trip-routes" className="relative bg-[#0e0e0e] py-16 md:py-24">
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="mb-2 font-headline text-2xl font-bold uppercase leading-tight tracking-tight text-white md:text-[32px] md:leading-[1.2]">
                  เลือกเส้นทางที่ใช่ แล้วออกไปใช้ชีวิต
                </h2>
                <p className="text-base leading-relaxed text-neutral-400 md:text-[18px] md:leading-[1.6]">
                  Pick your trail and just go live.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-all hover:border-[#69daff] hover:text-[#69daff] md:h-12 md:w-12"
                  aria-label="previous routes"
                >
                  <MaterialIcon name="chevron_left" />
                </button>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-all hover:border-[#69daff] hover:text-[#69daff] md:h-12 md:w-12"
                  aria-label="next routes"
                >
                  <MaterialIcon name="chevron_right" />
                </button>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2 font-body md:gap-3">
              {REGION_OPTIONS.map((region) => (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => handleRegionChange(region.id)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors md:px-5 md:py-2 md:text-sm ${
                    selectedRegion === region.id
                      ? 'bg-[#69daff] text-black shadow-[0_0_20px_rgba(105,218,255,0.35)]'
                      : 'border border-white/10 bg-[#20201f] text-white hover:border-[#69daff] hover:text-[#69daff]'
                  }`}
                  aria-pressed={selectedRegion === region.id}
                >
                  {region.label}
                </button>
              ))}
            </div>

            <div className="mb-8 flex flex-wrap gap-2 font-body md:gap-3">
              {TRIP_TYPE_OPTIONS.map((typeOption) => (
                <button
                  key={typeOption.id}
                  type="button"
                  onClick={() => handleTripTypeChange(typeOption.id)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors md:px-5 md:py-2 md:text-sm ${
                    selectedTripType === typeOption.id
                      ? 'bg-[#69daff] text-black shadow-[0_0_20px_rgba(105,218,255,0.35)]'
                      : 'border border-white/10 bg-[#20201f] text-white hover:border-[#69daff] hover:text-[#69daff]'
                  }`}
                  aria-pressed={selectedTripType === typeOption.id}
                >
                  {typeOption.label}
                </button>
              ))}
            </div>

            {initialError && <ErrorPanel message={initialError} />}

            {!initialError && filteredRoutes.length === 0 && (
              <div className="rounded-xl bg-[#131313] px-6 py-16 text-center">
                <MaterialIcon name="route" className="mx-auto mb-4 text-5xl text-[#69daff]" />
                <h3 className="mb-2 font-headline text-2xl font-bold text-white">
                  ยังไม่มีเส้นทางในหมวดนี้
                </h3>
                <p className="text-neutral-400">ลองเลือกหมวดอื่นก่อน เดี๋ยว Lab เติมเส้นทางใหม่เข้ามาเรื่อยๆ</p>
              </div>
            )}

            {!initialError && visibleRoutes.length > 0 && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
                {visibleRoutes.map((route) => (
                  <TripRouteCard key={route.id} route={route} />
                ))}
              </div>
            )}

            {!initialError && hasMore && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => count + LOAD_MORE_COUNT)}
                  className="rounded-lg bg-[#69daff] px-6 py-2 font-headline text-sm font-black uppercase tracking-tighter text-black shadow-[0_0_24px_rgba(105,218,255,0.3)] transition-transform hover:scale-105 active:scale-95 md:px-8 md:py-3 md:text-base"
                >
                  โหลดเพิ่ม
                </button>
              </div>
            )}
          </div>
        </section>

        <SubmitRouteSection topRoutes={topRoutes} />
      </main>

      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}

function TripHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full bg-[#0e0e0e]/60 shadow-[0_20px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="font-headline text-xl font-black italic uppercase tracking-tighter text-[#69daff] md:text-2xl">
          CRAFTBIKELAB
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link className="font-headline uppercase tracking-tighter text-white/70 transition-colors hover:text-white" href="/news">
            News
          </Link>
          <Link className="font-headline uppercase tracking-tighter text-white/70 transition-colors hover:text-white" href="/shop">
            Shop
          </Link>
          <Link className="font-headline uppercase tracking-tighter text-white/70 transition-colors hover:text-white" href="/craft">
            Craft
          </Link>
          <Link className="border-b-2 border-[#69daff] pb-1 font-headline uppercase tracking-tighter text-[#69daff]" href="/trip">
            Trip
          </Link>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <button type="button" className="text-white/70 transition-all duration-300 hover:text-[#69daff] active:scale-95" aria-label="shopping cart">
            <MaterialIcon name="shopping_cart" />
          </button>
          <button type="button" className="text-white/70 transition-all duration-300 hover:text-[#69daff] active:scale-95" aria-label="account">
            <MaterialIcon name="account_circle" />
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="block text-white/70 transition-colors hover:text-[#69daff] md:hidden"
            aria-label="menu"
          >
            <MaterialIcon name={menuOpen ? 'close' : 'menu'} />
          </button>
        </div>
      </div>
      <div className={`mobile-menu border-t border-white/10 bg-[#0e0e0e]/95 shadow-lg backdrop-blur-xl md:hidden ${menuOpen ? '' : 'hidden'}`}>
        <div className="flex flex-col gap-4 px-4 py-4">
          <Link className="py-2 font-headline uppercase tracking-tighter text-white/80 transition-colors hover:text-[#69daff]" href="/news" onClick={() => setMenuOpen(false)}>
            News
          </Link>
          <Link className="py-2 font-headline uppercase tracking-tighter text-white/80 transition-colors hover:text-[#69daff]" href="/shop" onClick={() => setMenuOpen(false)}>
            Shop
          </Link>
          <Link className="py-2 font-headline uppercase tracking-tighter text-white/80 transition-colors hover:text-[#69daff]" href="/craft" onClick={() => setMenuOpen(false)}>
            Craft
          </Link>
          <Link className="py-2 font-headline uppercase tracking-tighter text-[#69daff]" href="/trip" onClick={() => setMenuOpen(false)}>
            Trip
          </Link>
        </div>
      </div>
      <div className="h-px w-full bg-gradient-to-b from-[#69daff]/10 to-transparent" />
    </nav>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="rounded-xl bg-[#241210] p-6 text-[#ffc4b6]">
      <div className="mb-2 font-headline text-lg font-bold uppercase tracking-tight text-white">
        โหลดข้อมูลไม่สำเร็จ
      </div>
      <p>{message}</p>
    </div>
  );
}

function TripRouteCard({ route }: { route: TripRoute }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [count, setCount] = useState(route.votes_count);
  const [liked, setLiked] = useState(false);
  const stops = route.stops ?? [];

  useEffect(() => {
    if (readLikedRoutes().includes(route.id)) {
      setLiked(true);
    }
  }, [route.id]);

  async function handleVote() {
    if (liked) return;
    const result = await voteTripRoute(route.id);
    if (result.ok) {
      setCount(result.count);
      setLiked(true);
      addLikedRoute(route.id);
    }
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl bg-[#131313] transition-all hover:-translate-y-2 hover:border-b-2 hover:border-[#69daff]">
      <div className="relative h-44 overflow-hidden md:h-56">
        {route.image_url ? (
          <img
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            src={route.image_url}
            alt={route.name}
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(105,218,255,0.28),transparent_32%),linear-gradient(135deg,#20201f,#0e0e0e)]" />
        )}
        <button
          type="button"
          onClick={handleVote}
          disabled={liked}
          aria-label="favorite route"
          aria-pressed={liked}
          className={`absolute right-2 top-2 flex items-center gap-1 rounded-full bg-[#1a1a1a]/70 px-2 py-1 shadow-[0_0_0_rgba(255,80,80,0)] backdrop-blur transition-all duration-200 md:right-4 md:top-4 md:px-2.5 md:py-1.5 ${
            liked ? 'text-[#ff4d6d]' : 'text-white hover:text-[#ff4d6d]'
          }`}
        >
          <MaterialIcon name="favorite" filled={liked} className="text-sm md:text-base" />
          <span className="text-xs font-bold md:text-sm">{count.toLocaleString('th-TH')}</span>
        </button>
        <div className="absolute left-2 top-2 rounded bg-[#20201f]/90 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-[#69daff] shadow-[inset_2px_0_0_#ff7350] backdrop-blur md:left-4 md:top-4 md:px-3 md:py-1 md:text-[10px]">
          {route.season ?? 'Open Ride'}
        </div>
      </div>

      <div className="flex flex-grow flex-col p-3 md:p-5">
        <h3 className="mb-1 font-headline text-sm font-semibold uppercase leading-tight text-white md:mb-2 md:text-base lg:text-lg">
          {route.name}
        </h3>
        <p className="mb-3 line-clamp-2 text-xs text-neutral-400 md:mb-4 md:text-sm">
          {route.description ?? 'เส้นทางนี้กำลังรอข้อมูลเพิ่มเติมจากทีม CraftBikeLab'}
        </p>
        <div className="mt-auto space-y-2 md:space-y-3">
          <a
            className="flex w-full items-center justify-center gap-1 rounded-lg bg-[#b42800] py-1.5 font-headline text-[10px] font-bold uppercase tracking-tighter text-[#fff6f4] transition-all hover:brightness-110 md:gap-2 md:py-2 md:text-xs"
            href={route.maps_url}
            target="_blank"
            rel="noreferrer"
          >
            <MaterialIcon name="map" className="text-sm" />
            View on Google Maps
          </a>
          {stops.length > 0 && (
            <button
              type="button"
              onClick={() => setDetailsOpen((value) => !value)}
              aria-expanded={detailsOpen}
              className="w-full rounded-lg border border-white/10 py-1.5 font-headline text-[10px] font-bold uppercase tracking-tighter text-white transition-all hover:bg-white/5 md:py-2 md:text-xs"
            >
              {detailsOpen ? 'ซ่อนจุดแวะ' : 'Trip Details'}
            </button>
          )}
        </div>

        {detailsOpen && stops.length > 0 && (
          <ol className="mt-3 space-y-2 border-t border-white/10 pt-3 md:mt-4 md:pt-4">
            {stops.map((stop, index) => (
              <li key={`${stop.label}-${index}`} className="text-xs text-neutral-300 md:text-sm">
                <span className="font-headline font-bold uppercase tracking-tighter text-[#69daff]">
                  {stop.label}
                </span>{' '}
                <span className="text-white">{stop.place}</span>
                {stop.note && <p className="mt-0.5 text-neutral-400">{stop.note}</p>}
                {stop.shop_recommendation && (
                  <p className="mt-0.5 text-[#ff7350]">แนะนำ: {stop.shop_recommendation}</p>
                )}
                {stop.attraction_recommendation && (
                  <p className="mt-0.5 text-[#69daff]">ที่เที่ยว: {stop.attraction_recommendation}</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </article>
  );
}

function SubmitRouteSection({ topRoutes }: { topRoutes: TripRoute[] }) {
  return (
    <section className="container mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
      <div className="glass-panel relative overflow-hidden rounded-2xl border border-white/5 p-6 md:p-12">
        <div className="absolute right-0 top-0 h-full w-1/3 translate-x-20 skew-x-12 bg-[#69daff] opacity-5" />
        <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row md:gap-12">
          <div className="md:w-2/3">
            <h2 className="mb-4 font-headline text-2xl font-bold leading-tight text-white text-glow-primary md:mb-6 md:text-[32px] md:leading-[1.2]">
              มีเส้นทางเด็ด อยากแบ่งปันเพื่อนไหม?
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-neutral-300 md:text-[18px] md:leading-[1.6]">
              ส่งลิงก์เส้นทางหรือพิกัดลับที่คุณเคยไป เพื่อให้เพื่อนนักบิดคนอื่นได้สัมผัสประสบการณ์เดียวกับคุณ ข้อมูลของคุณจะถูกนำมาจัดลำดับและเปิดโหวตโดยชุมชน
            </p>
          </div>
          <div className="w-full md:w-1/3">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#69daff] py-4 font-headline text-base font-black uppercase tracking-tighter text-black shadow-[0_0_30px_rgba(105,218,255,0.4)] transition-transform hover:scale-105 active:scale-95 md:py-5 md:text-lg"
            >
              ส่งเส้นทางของคุณ
              <MaterialIcon name="send" filled />
            </button>
          </div>
        </div>

        {topRoutes.length > 0 && (
          <div className="relative z-10 mt-8 md:mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-headline text-xs uppercase tracking-[0.3em] text-white/55 md:text-sm">
                Top Rated Routes
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#69daff]/80">
                โหวตจากชุมชน
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
              {topRoutes.map((route, index) => (
                <div key={route.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-[#131313] px-3 py-2 md:px-4 md:py-3">
                  <div>
                    <p className="font-headline text-[10px] uppercase tracking-widest text-[#69daff]/80 md:text-xs">
                      #{index + 1}
                    </p>
                    <p className="text-xs text-white md:text-sm">{route.name}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[#ff7350]">
                    <MaterialIcon name="favorite" filled className="text-sm md:text-base" />
                    <span className="text-xs text-white md:text-sm">{route.votes_count.toLocaleString('th-TH')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t border-white/10 bg-neutral-950/80 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl md:hidden">
      <MobileBottomNavItem label="Explore" icon="explore" active />
      <MobileBottomNavItem label="Plan" icon="route" />
      <MobileBottomNavItem label="Saved" icon="bookmark" />
      <MobileBottomNavItem label="Profile" icon="person" />
    </nav>
  );
}

function MobileBottomNavItem({
  label,
  icon,
  active = false,
}: {
  label: string;
  icon: string;
  active?: boolean;
}) {
  return (
    <a
      href="#trip-routes"
      className={`flex flex-col items-center justify-center transition-opacity ${
        active ? 'scale-110 text-sky-400' : 'text-neutral-500 opacity-70 hover:opacity-100'
      }`}
    >
      <MaterialIcon name={icon} filled={active} />
      <span className="mt-1 font-headline text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </a>
  );
}

function MaterialIcon({
  name,
  filled = false,
  className = '',
}: {
  name: string;
  filled?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
