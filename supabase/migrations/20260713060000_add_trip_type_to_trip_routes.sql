-- Categorize trip routes by trip length/style for curated collections
-- (day trip, weekend, multi-day road trip, seasonal recommendation).

alter table public.trip_routes
  add column if not exists trip_type text;

alter table public.trip_routes
  drop constraint if exists trip_routes_trip_type_check;

alter table public.trip_routes
  add constraint trip_routes_trip_type_check
  check (trip_type is null or trip_type in ('day_trip', 'weekend', 'road_trip', 'seasonal'));
