-- Atomic vote increment for trip_routes "favorite" button.
-- SECURITY DEFINER so anon can bump the count without a broad UPDATE policy on the table.
-- Only published routes are votable. Returns the new count so the client can update the UI.
create or replace function public.increment_trip_vote(p_route_id bigint)
returns integer
language sql
security definer
set search_path = public
as $$
  update trip_routes
     set votes_count = votes_count + 1
   where id = p_route_id
     and status = 'published'
  returning votes_count;
$$;

revoke all on function public.increment_trip_vote(bigint) from public;
grant execute on function public.increment_trip_vote(bigint) to anon, authenticated;
