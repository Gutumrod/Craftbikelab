# PRD: CraftBikeLab — Platform Consolidation & Trip-First Launch

**Project Owner:** คุณฟรี
**Written by:** Claude (Commander) — จากการรวบรวมข้อมูล 7 location (Hermes + AGY, verify แล้ว 2026-07-11) + เอกสารเดิมของโปรเจกต์ (PROJECT_DOC.md, MASTER_README.md, SHOP_PIPELINE.md)
**Created:** 2026-07-11
**Status:** Draft v1 — project-level, จะแตกเป็น PRD ย่อยรายหน้าต่อไป (Trip ก่อน)

---

## 1. Problem Statement

CraftBikeLab เป็นโปรเจกต์แพลตฟอร์มอะไหล่มอเตอร์ไซค์ตรงรุ่น + ชุมชนนักบิด ที่มีของจริงอยู่เยอะมาก (Supabase schema, Fitment Engine/Normalizer ทดสอบผ่านแล้ว 50/50, Alias Dataset 2,000+ entries, Design System ครบ, Affiliate partner ยืนยันแล้ว) แต่**งานกระจัดกระจายอยู่ 7 ที่บนดิสก์คนละก้อน ไม่มี git ที่รวมศูนย์จริง** (local repo หลักไม่มี remote, GitHub repo ที่มีก็เป็นแค่ snapshot เก่าคนละ history) เว็บไซต์จริง craftbikelab.com ยัง 404 ทุกหน้ายังเป็น iframe ครอบ static HTML เดิม ไม่มีหน้าไหนต่อ Supabase จริงเลยสักหน้า (ยกเว้น /search ที่เริ่มไว้)

ผลคือ: ทุกครั้งที่ CEO กลับมาทำต่อ ต้องเสียเวลาไล่หาว่าอะไรอยู่ที่ไหน อะไรเป็นของจริง อะไรเป็นของเก่า เสี่ยงทำงานซ้ำหรือทำงานจากข้อมูลผิดเวอร์ชัน (พิสูจน์แล้วจากที่ Hermes รอบแรก misclassify ผิดโปรเจกต์ และ Craftbikelab-Temp เป็นเวอร์ชันเก่ากว่าตัวจริง)

## 2. Goals

1. **รวมศูนย์โค้ด/ข้อมูลเข้า repo เดียว** ที่ push ขึ้น GitHub จริง (`github.com/Gutumrod/Craftbikelab`) ภายในรอบทำงานถัดไป — ไม่มีงานสำคัญอยู่นอก git อีก
2. **หน้าทริปแรก (Trip) ใช้งานได้จริงแบบ dynamic** — ดึงข้อมูลจาก Supabase แทน static iframe ได้ก่อนหน้าอื่น (ตามลำดับที่ CEO ยืนยัน 2026-07-11: Trip → Shop → News/Craft)
3. **ปลด blocker เทคนิคหลัก 3 จุด** ที่ขวางทุกหน้าอยู่: n8n AI-enrich ไม่เสถียร, Cloudflare R2 ไม่เคยทดสอบ, ตัดสินใจ Supabase vs Neon DB ให้จบ (เลิกมีสองระบบพร้อมกัน)
4. **ทีมงาน (Claude + Codex) ทำงานจากข้อมูลชุดเดียวกันเสมอ** — ไม่มีเวอร์ชันขัดแย้งกันระหว่างคนละที่เก็บอีก

## 3. Non-Goals

- **ไม่ทำหน้า Shop/Craft/News ในรอบนี้** — เก็บไว้เป็น phase ถัดไปตามลำดับที่ตกลง (Trip ก่อน) ไม่ใช่เพราะไม่สำคัญ แค่ยังไม่ถึงคิว
- **ไม่ทำ AI-driven Craft page (รุ่นรถ+งบ→แนะนำของแต่ง)** ในรอบนี้ — ยังไม่ตัดสินใจว่าจะใช้ AI หรือ logic ธรรมดา (ค้างจาก PROJECT_DOC.md เดิม) รอ phase ที่เกี่ยวข้องค่อยตัดสินใจ
- **ไม่รื้อ/ย้าย `craftbike_bot` และ `cbl-automation`** เข้า repo หลักในรอบนี้ — เป็นระบบปฏิบัติการคนละส่วน (Telegram bot / n8n infra) แยกดูแลต่อไปก่อน จนกว่าจะมีเหตุผลชัดที่ต้องรวม
- **ไม่แก้ Excel→Sheets pipeline (`Craftbikelab-auto-sendrows`) ที่หยุดใช้งานอยู่** — ปล่อยไว้เฉยๆ ไม่ลบไม่แก้ จนกว่าจะกลับมาทำ Shop
- **ไม่ตั้ง deadline ตายตัว** — CEO ยืนยันแล้วว่ายังไม่มีเป้าหมายเวลาที่ต้อง live เดือนไหน (2026-07-11)

## 4. User Stories

**นักท่องเที่ยวสายมอเตอร์ไซค์ (ผู้ใช้หน้า Trip)**
- As a นักบิดที่กำลังหาที่เที่ยว ผมอยากดูเส้นทางท่องเที่ยวพร้อม Google Maps link เดียวจบ (ต้นทาง+ปลายทาง+waypoints) เพื่อไม่ต้องปะติดปะต่อเส้นทางเอง
- As a นักบิด ผมอยากเห็นจุดแวะพัก/ที่พัก/ร้านอาหารระหว่างทาง เพื่อวางแผนทริปได้ครบในที่เดียว
- As a นักบิดที่เคยไปเส้นทางนั้นมาก่อน ผมอยากส่งเส้นทางของตัวเองเข้าระบบ (ผ่าน Line OA/Email/Facebook) พร้อมรูป เพื่อแบ่งปันให้คนอื่นและได้เครดิตชื่อ
- As a ผู้ใช้ทุกคน ผมไม่อยากเห็นสินค้า/โปรโมทของแต่งปนอยู่ในหน้านี้ (กฎเหล็กเดิม — Trip ต้องสะอาดจากการขายของ)

**CEO/เจ้าของโปรเจกต์ (ผู้ดูแลระบบ)**
- As เจ้าของโปรเจกต์ ผมอยากมี repo เดียวที่เชื่อถือได้ว่าเป็นของจริงล่าสุด เพื่อไม่ต้องเดาว่าไฟล์ไหนคือเวอร์ชันถูกต้อง
- As เจ้าของโปรเจกต์ ผมอยากให้ Codex ทำงานจาก brief ที่ชัดเจน ไม่ใช่ให้ agent ไปเดาเอง (บทเรียนจากเหตุการณ์ Antigravity แก้โค้ดเกินขอบเขตที่เคยเกิดกับ bike-booking-saas)

## 5. Requirements

### Must-Have (P0)

**P0.1 — Git consolidation [ตอบแล้ว 2026-07-11: Force-push ทับ]**
- CEO ยืนยัน force-push ทับของเก่าบน GitHub ได้เลย (มี local clone backup ประวัติเก่าไว้แล้วจาก reconciliation ที่ทำไปก่อนหน้า ไม่ต้องกังวลเรื่องหาย)
- เก็บไฟล์ที่ GitHub มีแต่ local ไม่มีก่อน (`Shop-control-panel.html`, `wait.html`) กัน data loss ก่อน force-push
- Commit งานที่ค้างอยู่ 5 ไฟล์ใน `D:\Craftbikelab-Project` (search page, normalizer.ts, Craftbikelab-Admin.html, package.json/lock)
- `git remote add origin https://github.com/Gutumrod/Craftbikelab.git` แล้ว `git push -f origin main` ให้ local เป็น source of truth บน GitHub
- Acceptance: `git log` บน GitHub ตรงกับ local, ไฟล์ที่เก็บสำรองไว้ (Shop-control-panel.html, wait.html) ถูกใส่กลับเข้า repo แล้วก่อน push, README/START-HERE อธิบาย workflow ใหม่ถูกต้อง

**P0.2 — Trip page: static → dynamic**
- ใช้ `web/legacy-html/Editfooter/Trip.html` เป็น reference design ตัวจริง (ยืนยันจาก CEO — ไม่ใช่เวอร์ชัน Craftbikelab-Temp หรือ X: Drive)
- แปลงเป็น React component จริงใน `web/app/trip/` (เลิกใช้ iframe) ตาม pattern ที่ `/search` เริ่มไว้แล้ว (`SearchResultsClient.tsx`)
- ต่อ Supabase จริง — ต้องมี schema ตารางสำหรับ trip routes (ยังไม่มีในปัจจุบัน ต้องออกแบบใหม่ — `schema.sql` ปัจจุบันมีแต่ตาราง affiliate_products/product_model_mapping/model_aliases ไม่มีตาราง trip)
- เนื้อหาเริ่มต้น: ใช้บทความ "10 เส้นทางใกล้กรุงเทพฯ พร้อม Route Google Maps" ที่มีอยู่แล้วใน `D:\CraftBikeLab\Content\Trip\`
- Acceptance: `/trip` แสดงข้อมูลจาก Supabase จริง ไม่ใช่ hardcode, ไม่มีสินค้า/โปรโมท Shop ปนอยู่ (กฎเหล็กเดิม)

**Schema ตาราง `trip_routes` [ตอบแล้ว 2026-07-11 — ออกแบบจาก pattern `tripsData` ใน `Trip.html:379-459` + field ที่ขาดตาม PROJECT_DOC.md]**

| Field | Type | ที่มา |
|---|---|---|
| `id` | bigserial PK | มีอยู่แล้วใน mockup |
| `name` | text | มีอยู่แล้วใน mockup เช่น "Mae Hong Son Loop - 1,864 Curves" |
| `region` | text | มีอยู่แล้ว (north/south/central/northeast) |
| `season` | text | มีอยู่แล้ว เช่น "Winter Session" |
| `description` | text | มีอยู่แล้ว |
| `image_url` | text | มีอยู่แล้ว — ย้ายจาก Google CDN URL เดิมไปใช้ Cloudflare R2 |
| `maps_url` | text | **ใหม่** — ลิงก์ Google Maps เดียว (ต้นทาง+ปลายทาง+waypoints) mockup เดิมไม่มีฟิลด์นี้เลยทั้งที่ PROJECT_DOC.md ระบุว่าเป็น core feature |
| `difficulty` | text | **ใหม่** — ทางชิล/ทางลุย/Custom (mockup ใช้ `season` แทนคร่าวๆ ไม่พอ) |
| `submitted_by` | text, nullable | **ใหม่** — เครดิตคนส่ง (null = ทีมทำเอง) |
| `submitted_via` | text, nullable | **ใหม่** — line/email/facebook |
| `votes_count` | int, default 0 | **ใหม่** — mockup มี UI "Top Rated Routes" แล้วแต่ hardcode ตัวเลข ไม่ผูก data จริง |
| `status` | text, default 'pending' | **ใหม่** — pending/published (pattern เดียวกับ `is_published` ของ Shop pipeline ใน SHOP_PIPELINE.md) |
| `created_at` | timestamptz, default now() | **ใหม่** |

**P0.3 — ตัดสินใจ Database เดียว [ตอบแล้ว 2026-07-11: Supabase]**
- เลือก **Supabase** เป็นตัวจริง (เหตุผล: Auth+Storage+Auto REST API+RLS ครบในตัวเดียว เหมาะกับโปรเจกต์เดี่ยวมากกว่า Neon ที่เด่นเรื่อง DB branching/serverless ซึ่งเหมาะกับทีมที่มี CI/CD หลาย environment มากกว่า — ไม่เกี่ยวกับ sunk cost ที่มีข้อมูลอยู่แล้ว)
- **Neon DB — เลิกใช้** ตัดออกจากแผนทั้งหมด ไม่ต้องอ้างอิงอีก
- Acceptance: มีแค่ Supabase connection string ใน `.env`, ลบ/ทำเครื่องหมายว่า Neon project เลิกใช้แล้ว

### Nice-to-Have (P1)

**P1.1 — ดึง docs/data ที่มีค่าจาก 2 location บน X: Drive เข้า repo**
- `X:\My Drive\Craftbikelab DATA` (Module Specs, Daily Progress, Brand Design) → ย้ายเข้า `engine/data/` ที่ยังไม่มี
- ตรวจสอบว่าไม่ซ้ำกับของที่มีใน `D:\CraftBikeLab\ข้อมูล\` อยู่แล้ว (Bike Database.xlsx, alias dataset, blueprint docs)

**P1.2 — R2 upload pipeline ทดสอบจริงครั้งแรก**
- `r2_manager.py` มีโค้ดแล้วแต่ไม่เคยทดสอบจริง — รันทดสอบ upload รูป 1 รูปให้ผ่านก่อนใช้จริงกับ Trip page (รูปสถานที่ท่องเที่ยว)

### Future Considerations (P2)

- Shop page (ตามลำดับถัดไปหลัง Trip)
- News, Craft page
- แยก Subdomain ตาม PROJECT_DOC.md เดิม (shop./trip./craft.craftbikelab.com)
- n8n AI-enrich stability fix (เกี่ยวข้องกับ Shop pipeline โดยตรง ไม่ block Trip)
- ตัดสินใจเรื่อง `craftbike_bot`/`cbl-automation` ว่าจะรวม repo หรือแยกถาวร

## 6. Success Metrics

**ยังไม่มี deadline/เป้ารายได้ชัดเจน (ยืนยันจาก CEO 2026-07-11)** — metrics ด้านล่างเป็นตัวชี้วัดความคืบหน้า ไม่ใช่ business target:

- **Leading:** repo เดียวบน GitHub มี commit ล่าสุดตรงกับ local (เช็คได้ทันทีหลัง P0.1), `/trip` โหลดข้อมูลจริงจาก Supabase ได้ (ไม่ error, ไม่ hardcode)
- **Lagging:** จำนวนเส้นทางทริปที่ publish จริงในระบบ (เริ่มจาก 10 เส้นทางที่มีต้นฉบับอยู่แล้ว), ผู้ใช้ภายนอกส่งเส้นทางเข้ามาเองครั้งแรก (สัญญาณว่าฟีเจอร์แชร์เส้นทางใช้งานได้จริง)

## 7. Open Questions

**ทั้ง 3 ข้อตอบครบแล้ว (2026-07-11)** — ดูรายละเอียดใน P0.1 (force-push), P0.3 (Supabase), P0.2 (schema `trip_routes`) — พร้อมเขียนบรีฟให้ Codex เริ่มงานได้

- ~~Force-push ทับ GitHub เดิม หรือ merge unrelated histories?~~ **ตอบแล้ว: Force-push**
- ~~Supabase หรือ Neon DB?~~ **ตอบแล้ว: Supabase**
- ~~ตาราง Trip routes ควรมีฟิลด์อะไรบ้าง?~~ **ตอบแล้ว: ดู schema `trip_routes` ใน P0.2**
- **[Codex/Engineering]** วิธีรับเส้นทางจากผู้ใช้ (Line OA/Email/Facebook) เข้าระบบ — manual review ก่อน publish เหมือน Shop pipeline (`is_published=false` รอ approve) หรือ auto?

## 8. Timeline Considerations

- ไม่มี hard deadline
- Dependency ตามลำดับ: **P0.1 (git consolidation) ต้องเสร็จก่อน** ถึงจะเริ่ม P0.2 ได้อย่างปลอดภัย (ไม่งั้นงานที่ Codex ทำต่อจะเสี่ยงหายอีกถ้า git ยังไม่รวมศูนย์)
- Phasing ตามที่ CEO ยืนยัน: **Trip → Shop → News/Craft** (Trip ก่อนเพราะสร้าง awareness, Shop มาทีหลังแม้ PROJECT_DOC.md เดิมจะแนะนำ Shop-first ด้วยเหตุผลเงินสด — CEO ยืนยันคงลำดับเดิมแล้ว 2026-07-11)
