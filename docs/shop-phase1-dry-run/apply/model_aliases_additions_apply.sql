-- Apply file. Run after model_aliases_delete_apply.sql.
-- Inserts clean mechanical aliases only; numeric-tail garbage is filtered out.

insert into public.model_aliases (alias, brand, model_slug)
select v.alias, v.brand, v.model_slug
from (values
  ('crf250l', 'Honda', 'honda-crf250l'),
  ('himalayan400', 'RoyalEnfield', 'royalenfield-himalayan400'),
  ('hmalayan400', 'RoyalEnfield', 'royalenfield-himalayan400'),
  ('msx125', 'Honda', 'honda-msx125'),
  ('nmax155', 'Yamaha', 'yamaha-nmax155'),
  ('rader150', 'Suzuki', 'suzuki-raider150'),
  ('raider150', 'Suzuki', 'suzuki-raider150'),
  ('smash115', 'Suzuki', 'suzuki-smash115')
) as v(alias, brand, model_slug)
where not exists (
  select 1 from public.model_aliases ma where ma.alias = v.alias
);
