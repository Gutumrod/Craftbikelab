import type { Metadata } from 'next';
import TripRoutesClient from './TripRoutesClient';
import { getPublishedTripRoutes } from '@/lib/trip-routes';

export const dynamic = 'force-dynamic';

const TRIP_TITLE = 'Trip Routes | CraftBikeLab';
const TRIP_DESCRIPTION =
  'เส้นทางขี่มอเตอร์ไซค์และ Google Maps route สำหรับนักขี่ในไทย';
const TRIP_URL = 'https://craftbikelab.com/trip';

export const metadata: Metadata = {
  title: TRIP_TITLE,
  description: TRIP_DESCRIPTION,
  alternates: {
    canonical: TRIP_URL,
  },
  openGraph: {
    title: TRIP_TITLE,
    description: TRIP_DESCRIPTION,
    url: TRIP_URL,
    siteName: 'CraftBikeLab',
    type: 'website',
    locale: 'th_TH',
  },
  twitter: {
    card: 'summary_large_image',
    title: TRIP_TITLE,
    description: TRIP_DESCRIPTION,
  },
};

export default async function TripPage() {
  const { routes, error } = await getPublishedTripRoutes();

  return <TripRoutesClient routes={routes} initialError={error} />;
}
