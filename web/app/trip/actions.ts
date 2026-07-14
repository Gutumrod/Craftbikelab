'use server';

import { createHash } from 'node:crypto';
import { headers } from 'next/headers';

import { getSupabaseClient } from '@/lib/supabase';

export type VoteResult = { ok: true; count: number } | { ok: false };

// Salted hash of the caller's IP: the DB stores this, never the raw address, and the
// salt stops anyone with table access from reversing the small IPv4 space by brute force.
// Set VOTE_HASH_SALT in the deploy env; the fallback keeps local dev working.
const VOTE_HASH_SALT = process.env.VOTE_HASH_SALT ?? 'craftbikelab-trip-vote';

async function getVoterHash(): Promise<string> {
  const headerList = await headers();
  // Vercel puts the real client IP first in x-forwarded-for.
  const forwarded = headerList.get('x-forwarded-for') ?? '';
  const ip = forwarded.split(',')[0]?.trim() || headerList.get('x-real-ip') || 'unknown';

  return createHash('sha256').update(`${VOTE_HASH_SALT}:${ip}`).digest('hex');
}

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

  // The RPC records one vote row per (route, voter) and refuses to double-count, so a
  // repeat vote returns the current tally instead of inflating it. localStorage on the
  // client is only a UX hint — this is the real guard.
  const { data, error } = await supabase.rpc('increment_trip_vote', {
    p_route_id: routeId,
    p_voter_hash: await getVoterHash(),
  });

  if (error) {
    console.error('[TripRoutes] Failed to increment_trip_vote', {
      message: error.message,
      code: error.code,
    });
    return { ok: false };
  }

  // increment_trip_vote returns NULL when it updates 0 rows (route not found or
  // not published). Number(null) === 0 is finite, so guard on null explicitly —
  // otherwise a no-op vote would wrongly report a real count of 0 and lock the button.
  if (data == null) {
    return { ok: false };
  }

  const count = typeof data === 'number' ? data : Number(data);

  if (!Number.isFinite(count) || count < 0) {
    return { ok: false };
  }

  return { ok: true, count };
}

export type SubmitRouteInput = {
  name: string;
  region: string;
  maps_url: string;
  description?: string;
  submitted_by?: string;
  website?: string; // honeypot — must stay empty
};

export type SubmitRouteResult = { ok: true } | { ok: false; error: string };

const VALID_REGIONS = ['north', 'south', 'central', 'northeast'] as const;

// Accept the common Google Maps link shapes: google.*/maps, maps.google.*,
// maps.app.goo.gl short links, and goo.gl/maps short links.
const GOOGLE_MAPS_URL_REGEX =
  /^https?:\/\/(?:(?:[\w-]+\.)*google\.[a-z.]+\/maps\b|maps\.google\.[a-z.]+\/|maps\.app\.goo\.gl\/|(?:[\w-]+\.)*goo\.gl\/maps\b)/i;

export async function submitTripRoute(
  input: SubmitRouteInput,
): Promise<SubmitRouteResult> {
  if (!input || typeof input !== 'object') {
    return { ok: false, error: 'ข้อมูลไม่ถูกต้อง' };
  }

  // Honeypot: real users never fill this. Silently reject bots (report generic error).
  if (typeof input.website === 'string' && input.website.trim() !== '') {
    return { ok: false, error: 'ไม่สามารถส่งข้อมูลได้ ลองใหม่อีกครั้ง' };
  }

  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const region = typeof input.region === 'string' ? input.region.trim() : '';
  const mapsUrl = typeof input.maps_url === 'string' ? input.maps_url.trim() : '';
  const description =
    typeof input.description === 'string' ? input.description.trim() : '';
  const submittedBy =
    typeof input.submitted_by === 'string' ? input.submitted_by.trim() : '';

  if (!name) {
    return { ok: false, error: 'กรุณากรอกชื่อเส้นทาง' };
  }
  if (name.length > 120) {
    return { ok: false, error: 'ชื่อเส้นทางต้องไม่เกิน 120 ตัวอักษร' };
  }
  if (!VALID_REGIONS.includes(region as (typeof VALID_REGIONS)[number])) {
    return { ok: false, error: 'กรุณาเลือกภาคให้ถูกต้อง' };
  }
  if (!mapsUrl) {
    return { ok: false, error: 'กรุณากรอกลิงก์ Google Maps' };
  }
  if (!GOOGLE_MAPS_URL_REGEX.test(mapsUrl)) {
    return { ok: false, error: 'ลิงก์ต้องเป็น Google Maps ที่ถูกต้อง' };
  }
  if (description.length > 500) {
    return { ok: false, error: 'คำอธิบายต้องไม่เกิน 500 ตัวอักษร' };
  }
  if (submittedBy.length > 80) {
    return { ok: false, error: 'ชื่อผู้ส่งต้องไม่เกิน 80 ตัวอักษร' };
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    console.error('[TripRoutes] Missing Supabase env for trip_routes insert');
    return { ok: false, error: 'ระบบไม่พร้อมใช้งานชั่วคราว ลองใหม่อีกครั้ง' };
  }

  const { error } = await supabase.from('trip_routes').insert({
    name,
    region,
    maps_url: mapsUrl,
    description: description || null,
    submitted_by: submittedBy || null,
    submitted_via: 'web',
    status: 'pending',
    votes_count: 0,
  });

  if (error) {
    console.error('[TripRoutes] Failed to insert trip_route', {
      message: error.message,
      code: error.code,
    });
    return { ok: false, error: 'ส่งไม่สำเร็จ ลองใหม่อีกครั้ง' };
  }

  return { ok: true };
}
