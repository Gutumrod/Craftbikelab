-- Dry-run only. Review before running in Supabase SQL Editor.
-- Adds aliases missing from live DB. Suspicious live aliases are reported separately, not deleted here.

insert into public.model_aliases (alias, brand, model_slug)
values
  ('crf250l', 'Honda', 'honda-crf250l'),
  ('himalayan400', 'RoyalEnfield', 'royalenfield-himalayan400'),
  ('hmalayan400', 'RoyalEnfield', 'royalenfield-himalayan400'),
  ('msx125', 'Honda', 'honda-msx125'),
  ('nmax155', 'Yamaha', 'yamaha-nmax155'),
  ('rader150', 'Suzuki', 'suzuki-raider150'),
  ('raider150', 'Suzuki', 'suzuki-raider150'),
  ('smash115', 'Suzuki', 'suzuki-smash115')
on conflict (alias) do nothing;
