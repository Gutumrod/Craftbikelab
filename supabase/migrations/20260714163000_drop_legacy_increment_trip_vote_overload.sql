-- The 1-arg version is superseded by increment_trip_vote(bigint, text). Keeping both
-- left PostgREST unable to choose between the overloads, so every vote RPC failed
-- silently (the count never moved). Drop the old signature.
drop function if exists public.increment_trip_vote(bigint);
