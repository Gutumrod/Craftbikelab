-- Add waypoint/stop data to trip_routes for the Trip Details panel.

alter table public.trip_routes
  add column if not exists stops jsonb not null default '[]'::jsonb;
