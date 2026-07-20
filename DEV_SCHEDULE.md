# CraftBikeLab — ตารางพัฒนารายวัน

**สร้าง:** 2026-07-19 | **อัปเดต:** 2026-07-19 (รวม audit จาก Mac session 07-18 เข้ามาแล้ว) | **จังหวะ:** 3-4 ชม./วัน | **ทีม:** Claude (spec/review) + Codex (build) + CEO (ตัดสินใจ)

สถานะทำเครื่องหมาย: `[ ]` ยังไม่ทำ / `[x]` เสร็จแล้ว — อัปเดตในไฟล์นี้เมื่อจบแต่ละวัน

> **หมายเหตุสำคัญ:** Claude เครื่อง Mac (2026-07-18) audit โค้ดจริงเจอ gap ที่ชัดกว่าที่ตารางเดิมรู้ — `/shop`, `/news`, `/craft` ยัง serve static HTML legacy ทั้งหมด ส่วน `/trip`, `/admin`, `/search` เป็น Supabase จริงแล้ว **ที่สำคัญ: `/shop` มี data layer พร้อมใช้อยู่แล้ว** (`getProductsForAdmin()` ใน `web/lib/shop-products.ts` ที่ `/admin` ใช้งานจริงอยู่) แค่ยังไม่มีใครต่อฝั่ง public เข้าไป — verify โค้ดจริงแล้วตรงตามที่ Mac รายงาน จึงแทรก Day 2 ใหม่ (wire /shop) เข้ามาเพราะเป็น gap เล็กสุด คุณค่าสูงสุด และไม่ต้องรอคำตอบสัมภาษณ์เหมือนงานอื่น รายละเอียดเต็มอยู่ที่ `COMMANDER_PLAN.md` (root ของ repo, commit `b3544bf`)

---

## Day 1 — ปิด gap ค้าง + ตอบคำถามที่ค้างสัมภาษณ์
- [ ] (30 นาที, CEO) ตั้ง `VOTE_HASH_SALT_CBL` (ค่ามีอยู่แล้วใน `.secrets/keys.txt`) ลง Vercel Environment Variables → redeploy
- [ ] (30 นาที, Claude/CEO) ยิง R2 API จริงยืนยัน `R2_ACCESS_KEY_CBL`/`R2_SECRET_KEY_CBL` ใช้ได้ 100%
- [ ] (2-3 ชม., CEO คุยกับ Claude) ตอบ 3 คำถามค้างจาก discovery-interview:
  1. News content format — plain text หรือ rich text/แทรกรูปกลางเนื้อหา
  2. Craft section ต้องคุมอะไรบ้าง
  3. Mobile quick-add — Telegram bot (webhook) vs หน้าเว็บมือถือ
  4. **(ใหม่จาก Mac audit)** หน้า `/` (home) ที่ยัง static อยู่: ปล่อยไว้แบบเดิม หรือย้ายเป็น Next.js จริงด้วย (เพื่อให้โชว์ shop/trip แบบ live ได้ในอนาคต) — ไม่ต้องรีบตัดสินใจถ้ายังไม่มั่นใจ ข้ามไปก่อนได้ ไม่ block งานอื่น

> ข้อ 1-3 ปิดก่อนถึงจะ spec News/Craft/mobile ได้ (Day 3 เป็นต้นไป) — แต่ Day 2 (wire /shop) เริ่มได้เลยไม่ต้องรอ

## Day 2 — Wire `/shop` เข้า data layer จริง (gap เล็กสุด ไม่ต้องรอสัมภาษณ์)
- [ ] (Codex) เขียนฟังก์ชัน read สาธารณะใน `shop-products.ts` (คนละตัวกับ `getProductsForAdmin()` — ตัวนี้ต้อง filter เฉพาะ `status = 'active'` เท่านั้น อย่าเผลอใช้ตัว admin-scoped)
- [ ] (Codex) สร้าง public product grid component (อ้างอิง pattern จาก `/trip` client component ตัด control ฝั่ง admin ออก)
- [ ] (Codex) แทนที่ iframe เดิมใน `web/app/shop/page.tsx` ด้วยหน้าเพจจริง
- [ ] (Claude) review RLS: public role ต้องเห็นแค่ `active` เท่านั้น ห้ามเห็น `pending`/`archived`
- [ ] (Claude+CEO) verify: จำนวนสินค้าบน `/shop` ตรงกับที่ `/admin` โชว์เป็น `active`, ลิงก์ไป `/search` fitment ยังทำงานถูก

## Day 3 — Spec News feature (รอคำตอบ Day 1 ข้อ 1)
- [ ] (Claude) เขียนสเปก: DB table (หัวข้อ/เนื้อหา/รูปปก/วันที่/หมวดข่าว + format ที่ตอบจาก Day 1), admin CRUD UI, public `/news` wiring
- [ ] (Codex) เริ่ม migration สร้างตาราง Supabase

## Day 4-5 — Build News admin
- [ ] (Codex) Admin CRUD หน้า News (create/edit/publish/delete) ต่อแบบเดียวกับ P4 (service-role client)
- [ ] (Claude) review PR + เทส RLS policy ให้ตรง pattern เดิม (`pending`/`published` หรือเทียบเท่า)

## Day 6 — Wire public /news
- [ ] (Codex) เปลี่ยน `/news` จาก static HTML/hardcode `allSmallNews` เป็นดึงจาก DB
- [ ] (Claude+CEO) เทส end-to-end: เพิ่มข่าวจาก admin → โชว์หน้าเว็บจริง

## Day 7-8 — Trip: ฟอร์มเขียนเส้นทางเองตั้งแต่ต้น
- [ ] (Claude) สเปกฟอร์ม create (ไม่ใช่แค่ approve) ครบ field ที่ยืนยันแล้ว (`name`, `region`, `trip_type`, `season`, `description`, `image_url`, `maps_url`, `stops[]`, `difficulty`)
- [ ] (Codex) build ฟอร์ม admin + badge `difficulty` บนหน้าเว็บจริง
- [ ] (Claude) เกลาข้อมูล `difficulty` เก่าที่ปนกัน (สั้นๆ vs ประโยคเตือนเต็ม)

## Day 9 — Craft: schema + spec (รอคำตอบ Day 1 ข้อ 2)
- [ ] (Claude) สเปกตามคำตอบ Day 1 ข้อ 2 — ไม่มี schema เดิมเลย เป็นงานสร้างใหม่ทั้งหมดเหมือน News
- [ ] (Codex) build ตามสเปก (ขนาดงานไม่รู้จนกว่าจะสเปกเสร็จ — วันนี้อาจแค่สเปก ไม่ทัน build)

## Day 10-11 — Mobile quick-add
- [ ] (Claude) สเปกตามที่ตัดสินใจ Day 1 ข้อ 3
- [ ] (Codex) build (Telegram bot webhook ผ่าน Supabase Edge Function หรือหน้าเว็บมือถือ)

## Day 12 — Cleanup + QA รวม
- [ ] (Codex) แก้ `engine/test_r2_connection.py` ให้ชื่อ env var ตรงกับที่แอปจริงใช้
- [ ] (Codex) แก้ hardcoded path ใน `tools/shop-phase1-dry-run/build_dry_run.py`
- [ ] (CEO ตัดสินใจ, ถ้ายังไม่ได้ตอบ Day 1 ข้อ 4) หน้า home: ปล่อย static หรือย้าย Next.js
- [ ] (Claude+CEO) QA รวมทั้ง "ศูนย์สั่งการ" — Shop+Trip+News+Craft ทำงานจริงจาก `/admin` โดยไม่ต้องพึ่ง agent เขียนโค้ด

---

**หมายเหตุ:** Day 3 เป็นต้นไปเป็น timeline ชั่วคราว — ปริมาณงานจริงขึ้นกับคำตอบ Day 1 (โดยเฉพาะ Craft scope ที่ยังไม่มีภาพเลย อาจขยายเป็นหลายวัน) ปรับตารางใหม่หลัง Day 1 จบ
