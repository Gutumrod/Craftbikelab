'use server';

import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import type { ActionResult } from './actions';

const SERVICE_ROLE_ERROR = 'ระบบยังไม่ได้ตั้งค่า service-role key';
const GENERIC_ERROR = 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง';

export interface PendingTripRoute {
  id: number;
  name: string;
  region: string;
  maps_url: string;
  description: string | null;
  submitted_by: string | null;
  submitted_via: string | null;
  created_at: string;
}

export interface PendingTripRoutesResult {
  routes: PendingTripRoute[];
  error: string | null;
}

function validateRouteId(routeId: number): ActionResult | null {
  if (
    typeof routeId !== 'number' ||
    !Number.isInteger(routeId) ||
    routeId <= 0
  ) {
    return { ok: false, error: 'รหัสเส้นทางไม่ถูกต้อง' };
  }

  return null;
}

function getAdminClientOrError() {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return { supabase: null, result: { ok: false, error: SERVICE_ROLE_ERROR } as ActionResult };
  }

  return { supabase, result: null };
}

export async function getPendingTripRoutes(): Promise<PendingTripRoutesResult> {
  const { supabase } = getAdminClientOrError();

  if (!supabase) {
    console.error('[AdminTrips] Missing Supabase service-role env for pending trip select');
    return {
      routes: [],
      error: SERVICE_ROLE_ERROR,
    };
  }

  const { data, error } = await supabase
    .from('trip_routes')
    .select('id, name, region, maps_url, description, submitted_by, submitted_via, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[AdminTrips] Failed to select pending trip_routes', {
      message: error.message,
      code: error.code,
    });

    return {
      routes: [],
      error: 'ไม่สามารถโหลดเส้นทางรออนุมัติได้ ลองใหม่อีกครั้ง',
    };
  }

  return {
    routes: (data ?? []) as PendingTripRoute[],
    error: null,
  };
}

export async function approveTripRoute(routeId: number): Promise<ActionResult> {
  const routeIdError = validateRouteId(routeId);
  if (routeIdError) return routeIdError;

  const { supabase, result } = getAdminClientOrError();
  if (!supabase) return result;

  const { error } = await supabase
    .from('trip_routes')
    .update({ status: 'published' })
    .eq('id', routeId)
    .eq('status', 'pending');

  if (error) {
    console.error('[AdminTrips] Failed to approve trip_route', {
      routeId,
      message: error.message,
      code: error.code,
    });
    return { ok: false, error: GENERIC_ERROR };
  }

  return { ok: true };
}

export async function rejectTripRoute(routeId: number): Promise<ActionResult> {
  const routeIdError = validateRouteId(routeId);
  if (routeIdError) return routeIdError;

  const { supabase, result } = getAdminClientOrError();
  if (!supabase) return result;

  const { error } = await supabase
    .from('trip_routes')
    .delete()
    .eq('id', routeId)
    .eq('status', 'pending');

  if (error) {
    console.error('[AdminTrips] Failed to reject trip_route', {
      routeId,
      message: error.message,
      code: error.code,
    });
    return { ok: false, error: GENERIC_ERROR };
  }

  return { ok: true };
}
