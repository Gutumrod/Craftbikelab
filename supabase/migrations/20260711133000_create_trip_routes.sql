-- Create public motorcycle trip routes for the CraftBikeLab Trip page.
-- This migration is intentionally separate from engine/schema.sql.

create table if not exists public.trip_routes (
  id bigserial primary key,
  name text not null,
  region text not null,
  season text,
  description text,
  image_url text,
  maps_url text not null,
  difficulty text,
  submitted_by text,
  submitted_via text,
  votes_count integer not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  constraint trip_routes_region_check
    check (region in ('north', 'south', 'central', 'northeast')),
  constraint trip_routes_status_check
    check (status in ('pending', 'published')),
  constraint trip_routes_votes_count_check
    check (votes_count >= 0),
  constraint trip_routes_published_maps_url_check
    check (
      status <> 'published'
      or maps_url ~* '^https?://(www\.)?(google\.[^/]+/maps|maps\.app\.goo\.gl|goo\.gl/maps)'
    )
);

create index if not exists idx_trip_routes_status_created_at
  on public.trip_routes (status, created_at desc);

create index if not exists idx_trip_routes_region_status
  on public.trip_routes (region, status);

create index if not exists idx_trip_routes_votes_count
  on public.trip_routes (votes_count desc)
  where status = 'published';

alter table public.trip_routes enable row level security;

drop policy if exists "Public can read published trip routes" on public.trip_routes;
create policy "Public can read published trip routes"
  on public.trip_routes
  for select
  using (status = 'published');

grant select on public.trip_routes to anon, authenticated;
grant all on public.trip_routes to service_role;
grant usage, select on sequence public.trip_routes_id_seq to service_role;

insert into public.trip_routes (
  name,
  region,
  season,
  description,
  image_url,
  maps_url,
  difficulty,
  submitted_by,
  submitted_via,
  votes_count,
  status
) values
  (
    'Mae Hong Son Loop - 1,864 Curves',
    'north',
    'Winter Session',
    'The gold standard of Northern Thailand. Cold mountain air, long technical corners, and the classic loop through Pai, Mae Hong Son, and Mae Sariang.',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDqvoapLHCBZz5hzHTsRUPc37bRJgf3cxZYWnP_1jDFX_FTEgEjCYMhQn6n259rv_EL0nNy_zzLCVpUEm3hRDmWfhQII8L09NCvIrj9bugQLADTriRX7yNfStnBaBo7V1btab4FENf7Pw47VjQyHM6vaDahCLDjODaGlF5PqQl0GuLqcNu5bwhcOU2tGb2MMOxI3dgWdJAd0HQTa44zS3LwQX3YhFxaktLLJ_n8gJhu1iznP5NqyEUiM2DIAqZLPddFv1jIGTix0U4i',
    'https://www.google.com/maps/dir/Chiang+Mai/Pai/Mae+Hong+Son/Mae+Sariang/Chiang+Mai',
    'ทางลุย',
    null,
    null,
    1284,
    'published'
  ),
  (
    'Chanthaburi Coastal Run',
    'south',
    'Summer Heat',
    'High-speed sweeping curves along the Gulf of Thailand. Salt air, golden sunsets, and clean coastal asphalt for a relaxed long day ride.',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDuRVbTZgyBFAT1V5aB1z-ePrJbfuDDhgyqKnns_c1IxoyhTJ2lZMn6YQJCw64OvRwOPYKCUrClS4WGhMALaD38LmBjZMJODQA10gZmSCMTOaF0zsPDuCtmS_EPTTil2A0utajA9C64wtqRX2N5FVhwhiiuSv858BTbjQHnbF5FQFRQ8H5vjb-ZyM6HoIiV4GVFTmXsW3MQCifEiTuPJPPJ17oyvPAoe4Gb4ooPSx1XCzZAffiU0APkg5BTel94o3cAKSd8OkaAuiSc',
    'https://www.google.com/maps/dir/Bangkok/Chanthaburi/Noen+Nangphaya+Viewpoint/Chao+Lao+Beach/Bangkok',
    'ทางชิล',
    null,
    null,
    987,
    'published'
  ),
  (
    'Khao Yai Rainforest Ascent',
    'central',
    'Rainy Rhythm',
    'Deep greens and technical wet handling through Thailand''s first national park. A nature-first route with curves, viewpoints, and cool forest air.',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBhEjui6Tq3IcVULyedBfulXsAGXr3wWut1jDaBKMjt19rcA1IQCVPAOxuS5r38maWq_HcIIIcvmdnVb9GnUU9vPwVgE9qhU1550tBuyJLYJ9G3ydcEx-G7UKpsefWtOjwrSgEhTxb3Siq9AtXTH5sgnR89IrFG6pfdGTZqrPIIL1eGbtOApYfr7nGr3bXtbAbiKtTCh8SmERnH1rzIE4f2I3IhUXcg2LfdKqSQ-Ni52X3_8bYLuec9A3nf0AokcjINl8o21ZbUBv-s',
    'https://www.google.com/maps/dir/Bangkok/Primo+Piazza+Khao+Yai/The+Chocolate+Factory+Khao+Yai/Khao+Yai+National+Park/Bangkok',
    'ทางลุย',
    null,
    null,
    742,
    'published'
  ),
  (
    'Phu Kradueng Mountain Trail',
    'northeast',
    'Cool Breeze',
    'ยอดเขาสูงของเทือกเขาเพชรบูรณ์ เส้นทางชันท้าทาย วิวทะเลหมอก และบรรยากาศภูเขาที่เหมาะกับสายธรรมชาติ.',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBhEjui6Tq3IcVULyedBfulXsAGXr3wWut1jDaBKMjt19rcA1IQCVPAOxuS5r38maWq_HcIIIcvmdnVb9GnUU9vPwVgE9qhU1550tBuyJLYJ9G3ydcEx-G7UKpsefWtOjwrSgEhTxb3Siq9AtXTH5sgnR89IrFG6pfdGTZqrPIIL1eGbtOApYfr7nGr3bXtbAbiKtTCh8SmERnH1rzIE4f2I3IhUXcg2LfdKqSQ-Ni52X3_8bYLuec9A3nf0AokcjINl8o21ZbUBv-s',
    'https://www.google.com/maps/dir/Bangkok/Phu+Kradueng+National+Park/Pha+Nok+Aen/Bangkok',
    'ทางลุย',
    null,
    null,
    638,
    'published'
  ),
  (
    'Doi Inthanon Summit',
    'north',
    'Misty Morning',
    'จุดสูงสุดของประเทศไทย เส้นทางขึ้นเขาสวย อากาศเย็น วิว 360 องศา และโค้งต่อเนื่องระดับตำนาน.',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDqvoapLHCBZz5hzHTsRUPc37bRJgf3cxZYWnP_1jDFX_FTEgEjCYMhQn6n259rv_EL0nNy_zzLCVpUEm3hRDmWfhQII8L09NCvIrj9bugQLADTriRX7yNfStnBaBo7V1btab4FENf7Pw47VjQyHM6vaDahCLDjODaGlF5PqQl0GuLqcNu5bwhcOU2tGb2MMOxI3dgWdJAd0HQTa44zS3LwQX3YhFxaktLLJ_n8gJhu1iznP5NqyEUiM2DIAqZLPddFv1jIGTix0U4i',
    'https://www.google.com/maps/dir/Chiang+Mai/Doi+Inthanon+National+Park/Kew+Mae+Pan+Nature+Trail/Chiang+Mai',
    'ทางลุย',
    null,
    null,
    621,
    'published'
  ),
  (
    'Khao Sam Roi Yot Coastal',
    'central',
    'Sunny Coast',
    'เส้นทางเลียบชายหาดอุทยานแห่งชาติ วิวทะเลกับภูเขาหินปูน ถนนเรียบ ลมทะเลเย็น เหมาะกับการขี่ชิลล์.',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDuRVbTZgyBFAT1V5aB1z-ePrJbfuDDhgyqKnns_c1IxoyhTJ2lZMn6YQJCw64OvRwOPYKCUrClS4WGhMALaD38LmBjZMJODQA10gZmSCMTOaF0zsPDuCtmS_EPTTil2A0utajA9C64wtqRX2N5FVhwhiiuSv858BTbjQHnbF5FQFRQ8H5vjb-ZyM6HoIiV4GVFTmXsW3MQCifEiTuPJPPJ17oyvPAoe4Gb4ooPSx1XCzZAffiU0APkg5BTel94o3cAKSd8OkaAuiSc',
    'https://www.google.com/maps/dir/Bangkok/Khao+Sam+Roi+Yot+National+Park/Phraya+Nakhon+Cave/Bangkok',
    'ทางชิล',
    null,
    null,
    577,
    'published'
  ),
  (
    'Petchabun Skyline',
    'north',
    'Winter Peak',
    'เส้นทางขอบเขาที่เชื่อมภาคเหนือกับอีสาน วิวทะเลหมอก อากาศหนาว และจังหวะโค้งภูเขาที่ขี่สนุก.',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDqvoapLHCBZz5hzHTsRUPc37bRJgf3cxZYWnP_1jDFX_FTEgEjCYMhQn6n259rv_EL0nNy_zzLCVpUEm3hRDmWfhQII8L09NCvIrj9bugQLADTriRX7yNfStnBaBo7V1btab4FENf7Pw47VjQyHM6vaDahCLDjODaGlF5PqQl0GuLqcNu5bwhcOU2tGb2MMOxI3dgWdJAd0HQTa44zS3LwQX3YhFxaktLLJ_n8gJhu1iznP5NqyEUiM2DIAqZLPddFv1jIGTix0U4i',
    'https://www.google.com/maps/dir/Bangkok/Khao+Kho/Phu+Thap+Buek/Phetchabun/Bangkok',
    'ทางลุย',
    null,
    null,
    511,
    'published'
  ),
  (
    'Nakhon Si Thammarat Twisties',
    'south',
    'Green Season',
    'เส้นทางเลียบเขาหลวง โค้งหักศอกและวิวป่าเขียวขจี เหมาะกับนักขี่ที่ชอบความท้าทายแบบภาคใต้.',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDuRVbTZgyBFAT1V5aB1z-ePrJbfuDDhgyqKnns_c1IxoyhTJ2lZMn6YQJCw64OvRwOPYKCUrClS4WGhMALaD38LmBjZMJODQA10gZmSCMTOaF0zsPDuCtmS_EPTTil2A0utajA9C64wtqRX2N5FVhwhiiuSv858BTbjQHnbF5FQFRQ8H5vjb-ZyM6HoIiV4GVFTmXsW3MQCifEiTuPJPPJ17oyvPAoe4Gb4ooPSx1XCzZAffiU0APkg5BTel94o3cAKSd8OkaAuiSc',
    'https://www.google.com/maps/dir/Nakhon+Si+Thammarat/Khao+Luang+National+Park/Kiriwong+Village/Nakhon+Si+Thammarat',
    'ทางลุย',
    null,
    null,
    466,
    'published'
  ),
  (
    'Ubon Ratchathani Mekong Ride',
    'northeast',
    'Sunset Glow',
    'เส้นทางเลียบแม่น้ำโขง สองข้างทางเป็นวิวทุ่งนาและพระอาทิตย์ตก เหมาะกับการขี่ชิลล์ช่วงเย็น.',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBhEjui6Tq3IcVULyedBfulXsAGXr3wWut1jDaBKMjt19rcA1IQCVPAOxuS5r38maWq_HcIIIcvmdnVb9GnUU9vPwVgE9qhU1550tBuyJLYJ9G3ydcEx-G7UKpsefWtOjwrSgEhTxb3Siq9AtXTH5sgnR89IrFG6pfdGTZqrPIIL1eGbtOApYfr7nGr3bXtbAbiKtTCh8SmERnH1rzIE4f2I3IhUXcg2LfdKqSQ-Ni52X3_8bYLuec9A3nf0AokcjINl8o21ZbUBv-s',
    'https://www.google.com/maps/dir/Ubon+Ratchathani/Pha+Taem+National+Park/Khong+Chiam/Ubon+Ratchathani',
    'ทางชิล',
    null,
    null,
    438,
    'published'
  ),
  (
    'Kanchanaburi Erawan Loop',
    'central',
    'Rainforest Fresh',
    'เส้นทางผ่านน้ำตกเอราวัณและเขื่อนศรีนครินทร์ ถนนร่มรื่น วิวภูเขาและน้ำ เหมาะกับทริปวันหยุด.',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDuRVbTZgyBFAT1V5aB1z-ePrJbfuDDhgyqKnns_c1IxoyhTJ2lZMn6YQJCw64OvRwOPYKCUrClS4WGhMALaD38LmBjZMJODQA10gZmSCMTOaF0zsPDuCtmS_EPTTil2A0utajA9C64wtqRX2N5FVhwhiiuSv858BTbjQHnbF5FQFRQ8H5vjb-ZyM6HoIiV4GVFTmXsW3MQCifEiTuPJPPJ17oyvPAoe4Gb4ooPSx1XCzZAffiU0APkg5BTel94o3cAKSd8OkaAuiSc',
    'https://www.google.com/maps/dir/Bangkok/Bridge+Over+the+River+Kwai/Erawan+National+Park/Srinagarind+Dam/Bangkok',
    'ทางชิล',
    null,
    null,
    394,
    'published'
  )
on conflict do nothing;
