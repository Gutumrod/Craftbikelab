'use server';

import { getSupabaseClient } from '@/lib/supabase';

export type VoteResult = { ok: true; count: number } | { ok: false };

export async function voteTripRoute(routeId: number): Promise<VoteResult> {
  if (
    typeof routeId !== 'number' ||
    !Number.isInteger(routeId) ||
    routeId <= 0
  ) {
    return { ok: false };
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    console.error('[TripRoutes] Missing Supabase env for increment_trip_vote');
    return { ok: false };
  }

  const { data, error } = await supabase.rpc('increment_trip_vote', {
    p_route_id: routeId,
  });

  if (error) {
    console.error('[TripRoutes] Failed to increment_trip_vote', {
      message: error.message,
      code: error.code,
    });
    return { ok: false };
  }

  const count = typeof data === 'number' ? data : Number(data);

  if (!Number.isFinite(count)) {
    return { ok: false };
  }

  return { ok: true, count };
}
