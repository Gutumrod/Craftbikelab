# CraftBikeLab — ตารางพัฒนารายวัน

**สร้าง:** 2026-07-19 | **จังหวะ:** 3-4 ชม./วัน | **ทีม:** Claude (spec/review) + Codex (build) + CEO (ตัดสินใจ)

สถานะทำเครื่องหมาย: `[ ]` ยังไม่ทำ / `[x]` เสร็จแล้ว — อัปเดตในไฟล์นี้เมื่อจบแต่ละวัน

---

## Day 1 — ปิด gap ค้าง + ตอบคำถามที่ค้างสัมภาษณ์
- [ ] (30 นาที, CEO) ตั้ง `VOTE_HASH_SALT_CBL` (ค่ามีอยู่แล้วใน `.secrets/keys.txt`) ลง Vercel Environment Variables → redeploy
- [ ] (30 นาที, Claude/CEO) ยิง R2 API จริงยืนยัน `R2_ACCESS_KEY_CBL`/`R2_SECRET_KEY_CBL` ใช้ได้ 100%
- [ ] (2-3 ชม., CEO คุยกับ Claude) ตอบ 3 คำถามค้างจาก discovery-interview:
  1. News content format — plain text หรือ rich text/แทรกรูปกลางเนื้อหา
  2. Craft section ต้องคุมอะไรบ้าง
  3. Mobile quick-add — Telegram bot (webhook) vs หน้าเว็บมือถือ

> ปิดวันนี้ก่อนถึงจะ spec วันถัดไปได้ — Day 2 เป็นต้นไปรอคำตอบจากข้อ 3

## Day 2 — Spec News feature
- [ ] (Claude) เขียนสเปก: DB table (หัวข้อ/เนื้อหา/รูปปก/วันที่/หมวดข่าว + format ที่ตอบจาก Day 1), admin CRUD UI, public `/news` wiring
- [ ] (Codex) เริ่ม migration สร้างตาราง Supabase

## Day 3-4 — Build News admin
- [ ] (Codex) Admin CRUD หน้า News (create/edit/publish/delete) ต่อแบบเดียวกับ P4 (service-role client)
- [ ] (Claude) review PR + เทส RLS policy ให้ตรง pattern เดิม (`pending`/`published` หรือเทียบเท่า)

## Day 5 — Wire public /news
- [ ] (Codex) เปลี่ยน `/news` จาก hardcode `allSmallNews` เป็นดึงจาก DB
- [ ] (Claude+CEO) เทส end-to-end: เพิ่มข่าวจาก admin → โชว์หน้าเว็บจริง

## Day 6-7 — Trip: ฟอร์มเขียนเส้นทางเองตั้งแต่ต้น
- [ ] (Claude) สเปกฟอร์ม create (ไม่ใช่แค่ approve) ครบ field ที่ยืนยันแล้ว (`name`, `region`, `trip_type`, `season`, `description`, `image_url`, `maps_url`, `stops[]`, `difficulty`)
- [ ] (Codex) build ฟอร์ม admin + badge `difficulty` บนหน้าเว็บจริง
- [ ] (Claude) เกลาข้อมูล `difficulty` เก่าที่ปนกัน (สั้นๆ vs ประโยคเตือนเต็ม)

## Day 8 — Craft section
- [ ] (Claude) สเปกตามคำตอบ Day 1 ข้อ 2
- [ ] (Codex) build ตามสเปก (ขนาดงานไม่รู้จนกว่าจะสเปกเสร็จ — วันนี้อาจแค่สเปก ไม่ทันbuild)

## Day 9-10 — Mobile quick-add
- [ ] (Claude) สเปกตามที่ตัดสินใจ Day 1 ข้อ 3
- [ ] (Codex) build (Telegram bot webhook ผ่าน Supabase Edge Function หรือหน้าเว็บมือถือ)

## Day 11 — Cleanup + QA รวม
- [ ] (Codex) แก้ `engine/test_r2_connection.py` ให้ชื่อ env var ตรงกับที่แอปจริงใช้
- [ ] (Codex) แก้ hardcoded path ใน `tools/shop-phase1-dry-run/build_dry_run.py`
- [ ] (Claude+CEO) QA รวมทั้ง "ศูนย์สั่งการ" — Shop+Trip+News+Craft ทำงานจริงจาก `/admin` โดยไม่ต้องพึ่ง agent เขียนโค้ด

---

**หมายเหตุ:** Day 2 เป็นต้นไปเป็น timeline ชั่วคราว — ปริมาณงานจริงขึ้นกับคำตอบ Day 1 (โดยเฉพาะ Craft scope ที่ยังไม่มีภาพเลย อาจขยายเป็นหลายวัน) ปรับตารางใหม่หลัง Day 1 จบ
