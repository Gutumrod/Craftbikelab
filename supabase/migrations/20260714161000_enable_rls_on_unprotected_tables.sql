-- These 4 tables had RLS disabled: the public web app ships an anon key, so anyone
-- could read AND write them — including injecting rows into remote_commands, an agent
-- command queue. Nothing public reads them (the Next app touches none of the four; the
-- admin dashboard uses a service_role key, which bypasses RLS), so enable RLS with no
-- policies = service_role only.
alter table public.models enable row level security;
alter table public.affiliate_products enable row level security;
alter table public.product_model_mapping enable row level security;
alter table public.remote_commands enable row level security;
