import type { Metadata } from 'next';
import TripRoutesClient from './TripRoutesClient';
import { getPublishedTripRoutes } from '@/lib/trip-routes';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Trip Routes | CraftBikeLab',
  description: 'เส้นทางขี่มอเตอร์ไซค์และ Google Maps route สำหรับนักขี่ในไทย',
};

export default async function TripPage() {
  const { routes, error } = await getPublishedTripRoutes();

  return <TripRoutesClient routes={routes} initialError={error} />;
}
