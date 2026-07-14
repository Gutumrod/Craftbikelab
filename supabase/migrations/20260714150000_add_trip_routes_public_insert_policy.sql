-- Allow the public "ส่งเส้นทาง" form to insert community submissions, but ONLY as
-- unpublished (status='pending') rows with no pre-seeded votes. Anon still cannot
-- publish or vote-stuff via insert; admin/service_role handles review + publish.
create policy "Public can submit pending trip routes"
  on public.trip_routes
  for insert
  to anon, authenticated
  with check (status = 'pending' and votes_count = 0);
