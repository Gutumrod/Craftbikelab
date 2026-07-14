-- Server-side vote dedup. The old flow only guarded with localStorage, so clearing
-- storage / incognito let one person vote a route unlimited times. Record one row per
-- (route, voter) and let the primary key reject repeats.
--
-- voter_hash is a salted hash of the client IP computed in the server action — the raw
-- IP never reaches the database. Only the SECURITY DEFINER function below touches this
-- table; RLS is on with no policies, so anon cannot read or forge vote records.
create table if not exists public.trip_route_votes (
  route_id   bigint not null references public.trip_routes(id) on delete cascade,
  voter_hash text   not null,
  created_at timestamptz not null default now(),
  primary key (route_id, voter_hash)
);

alter table public.trip_route_votes enable row level security;

-- New 2-arg version. Returns the resulting count; if this voter already voted, it
-- returns the CURRENT count without incrementing (idempotent, no error).
-- Returns NULL when the route does not exist or is not published.
create or replace function public.increment_trip_vote(p_route_id bigint, p_voter_hash text)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_count integer;
  v_inserted boolean := false;
begin
  -- Only published routes are votable.
  select votes_count into v_count
    from trip_routes
   where id = p_route_id and status = 'published';

  if not found then
    return null;
  end if;

  insert into trip_route_votes (route_id, voter_hash)
  values (p_route_id, p_voter_hash)
  on conflict (route_id, voter_hash) do nothing;

  get diagnostics v_inserted = row_count;

  if not v_inserted then
    -- already voted: report the current tally, do not double-count
    return v_count;
  end if;

  update trip_routes
     set votes_count = votes_count + 1
   where id = p_route_id and status = 'published'
  returning votes_count into v_count;

  return v_count;
end;
$function$;
