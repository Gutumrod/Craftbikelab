import { getSupabaseClient } from '@/lib/supabase';

export type TripRegion = 'north' | 'south' | 'central' | 'northeast';
export type TripStatus = 'pending' | 'published';
export type TripType = 'day_trip' | 'weekend' | 'road_trip' | 'seasonal' | null;

export interface TripStop {
  label: string;
  place: string;
  note?: string;
  shop_recommendation?: string;
  attraction_recommendation?: string;
}

export interface TripRoute {
  id: number;
  name: string;
  region: TripRegion;
  trip_type: TripType;
  season: string | null;
  description: string | null;
  image_url: string | null;
  maps_url: string;
  difficulty: string | null;
  submitted_by: string | null;
  submitted_via: string | null;
  votes_count: number;
  status: TripStatus;
  created_at: string;
  stops: TripStop[];
}

export interface TripRoutesResult {
  routes: TripRoute[];
  error: string | null;
}

export async function getPublishedTripRoutes(): Promise<TripRoutesResult> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    console.error('[TripRoutes] Missing Supabase env for trip_routes select');
    return {
      routes: [],
      error: 'ไม่สามารถโหลดข้อมูลเส้นทางได้ ลองใหม่อีกครั้ง',
    };
  }

  const { data, error } = await supabase
    .from('trip_routes')
    .select(
      'id, name, region, season, description, image_url, maps_url, difficulty, submitted_by, submitted_via, votes_count, status, created_at, stops, trip_type',
    )
    .eq('status', 'published')
    .order('votes_count', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[TripRoutes] Failed to select published trip_routes', {
      message: error.message,
      code: error.code,
    });

    return {
      routes: [],
      error: 'ไม่สามารถโหลดข้อมูลเส้นทางได้ ลองใหม่อีกครั้ง',
    };
  }

  return {
    routes: (data ?? []) as TripRoute[],
    error: null,
  };
}
