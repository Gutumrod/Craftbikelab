# Shop Page — Implementation Plan (draft v1)

**สถานะ:** อัปเดตหลังพบเครื่องมือ capture จริง — CEO ยืนยันแนวทางแล้ว พร้อมเริ่ม Phase 1
**วันที่:** 2026-07-14 (v2 — แก้ไขหลังอ่านโค้ด extension จริง)
**เกี่ยวข้อง:** `SHOP_PIPELINE.md` เดิม (2026-04-29) **เป็นเอกสารล้าสมัย** พูดถึง pipeline ที่ไม่ได้ใช้งานจริง (Bigsaler xlsx / Involve Asia API / n8n) — ของจริงที่ใช้งานอยู่คือ Chrome extension `craftbikelab-capture` (ดูหัวข้อ 2.3)

---

## 1. สรุป Requirements ที่ยืนยันแล้ว (จากสัมภาษณ์)

| หัวข้อ | คำตอบ |
|---|---|
| ลูกค้าเป้าหมาย | คนขี่มอเตอร์ไซค์หาอะไหล่/ของแต่งที่ **ใส่รุ่นรถตัวเองได้จริง** (หลัก) + อยากได้คำอธิบายชัดเจนประกอบ (รอง) + เปิดโอกาสร้านค้ามาลงเอง (อนาคต) |
| สินค้า | หลายประเภทผสมกัน (ไม่ใช่แค่หมวดเดียว) |
| ขอบเขตรุ่นรถ | **ครบทุกระดับ** ตั้งแต่ Wave/Click ไปถึง BMW/Ducati/Harley — ไม่จำกัดแค่รถทั่วไป |
| โมเดลธุรกิจ | **Affiliate link ล้วนตอนนี้** (เด้งไป Shopee/Lazada/TikTok) ไม่มี cart/checkout เอง — payment จริงจะสร้างใน **Bike Booking SaaS** (โปรเจกต์แยก) แล้วค่อยเชื่อมทีหลัง |
| รูปสินค้า | โหลดมาเก็บเองใน **Cloudflare R2** (ไม่ hotlink Shopee ตรง กันปัญหาเหมือนที่เจอกับ Wikimedia บนหน้า Trip) — ยังไม่มีระบบ automate การโหลด |
| การดูแลสินค้าต่อเนื่อง | มี Shopee scraper (n8n) อยู่แล้วแต่ **ไม่เสถียร** — ดึงรูปหน้าโปรโมชั่นผิด, กรอกข้อมูลไม่ครบ |
| Fitment UX | **แบบผสม** — มีตัวกรองเลือกรุ่นรถด้านบน + ยังเดินดูอิสระได้ตามหมวดปกติ |
| Affiliate network | **ใช้ Shopee affiliate portal ตรง (ไม่ใช่ Involve Asia) — ไม่มีลิมิตจำนวนลิงก์** ผ่าน Chrome extension ที่เขียนไว้แล้ว เป็นเครื่องมือหลักตอนนี้ (confirm แล้ว) |

---

## 2. สถานะปัจจุบันจริง (verify แล้ว ไม่ใช่แค่เอกสาร)

### 2.1 Schema จริงใน Supabase (ต่างจาก SHOP_PIPELINE.md เดิม)
```
affiliate_products: id, name, brand, category(default 'other'), price, status(default 'active'),
                     shopee_link, lazada_link, tiktok_link, image_urls(jsonb[]), metadata(jsonb),
                     is_universal(bool), slug, created_at, updated_at
models: id, Brand, Model, slug, Category, Type, created_at
product_model_mapping: id, product_id → affiliate_products, model_slug, created_at
model_aliases: id, alias, brand, model_slug, created_at, updated_at   (RLS เปิดแล้ว)
```
**ไม่มี** `model_slugs` column บน affiliate_products, **ไม่มี** `is_published`/`deeplink_status`/`original_link`/`spec` ตามที่ SHOP_PIPELINE.md เก่าเขียนไว้ — fitment ผูกผ่าน `product_model_mapping` (normalized, ถูกต้องกว่า array) ส่วน spec/original_link ควรเก็บใน `metadata` jsonb แทน

**ทั้ง 3 ตารางว่างเปล่า 0 แถวทั้งหมด** ณ วันนี้

### 2.2 ข้อมูลดิบที่มีอยู่ (3 ชีต Google Sheets)
| ไฟล์ | สภาพ | ใช้ได้แค่ไหน |
|---|---|---|
| `CBL_Affiliate_Pipeline` sheet (91 แถว, sheet ID `1SxZfdrt_k8R3chlBmOX4Z-NzcPTEXcSwWMaCGFDA928`) | brand กรอก 3/91, category 1/91, model fitment 1/91, price 13/91 | **นี่คือ output ตรงจาก extension auto-scan mode** (ดู 2.3) — ว่างเปล่าเพราะ auto-scan **ตั้งใจข้าม** field พวกนี้ ไม่ใช่ AI พัง ต้องคลีน/เติมมือหรือกึ่งอัตโนมัติ |
| Model master list (~250 รุ่น) | ครบทุกยี่ห้อ มี slug/category/type แล้ว คุณภาพดี | ใช้เป็นฐานได้ แต่ขาดรุ่นเก่า (เช่น Wave100) ต้องเสริม |
| Alias dictionary | ของจริง ~45 แถวบนสุด ที่เหลือหลายร้อยแถวเป็น**ขยะซ้ำจาก bug generator** | ต้องคลีนทิ้งขยะ เหลือ pattern ที่ถูกต้องแล้วขยายต่อ |
| Motorcycle_Dataset (ไฟล์ที่ 3) | dataset ซ้อมสำหรับฟีเจอร์ AI แนะนำซื้อรถ | **นอก scope รอบนี้** พักไว้ |

### 2.3 เครื่องมือ capture จริง — `craftbikelab-capture` (Chrome extension, Manifest V3)

**Path:** `C:\Users\Win10\Downloads\CBL_Project\craftbikelab-capture`

**นี่คือเครื่องมือหลักตัวจริงที่ CEO ใช้งานอยู่** — เขียนไว้ดีกว่าที่ `SHOP_PIPELINE.md` บรรยาย:

| ไฟล์ | หน้าที่ |
|---|---|
| `manifest.json` | MV3 config, host permissions `shopee.co.th` + `affiliate.shopee.co.th`, OAuth scope `spreadsheets` |
| `content_shopee.js` | รันบนหน้าสินค้า/หน้าค้นหา Shopee — ดึง title/price/image/originalLink จากหน้าสินค้า, หรือสแกน listing พร้อม filter (rating≥4.5, ขายแล้ว≥100, ต้องมีป้าย EXTRACOMM) |
| `content_affiliate.js` | รันบนหน้า `affiliate.shopee.co.th/offer/custom_link` — กรอก URL สินค้าลง textarea, กดปุ่ม Generate, ดึง affiliate link ที่ได้ (จำลอง UI จริง ผ่าน React synthetic event — **เปราะบางถ้า Shopee เปลี่ยน DOM/class ชื่อ `ant-input`/`ant-btn-primary`**) |
| `background.js` | Service worker ประสาน tab, มี **28 default keyword** ค้นหาของแต่งมอเตอร์ไซค์ที่เตรียมไว้แล้ว, orchestrate auto-scan (เปิด tab สินค้าทีละอัน → capture → generate link → push sheet), รับมือ Shopee captcha (pause/resume อัตโนมัติ) |
| `popup.js` / `popup.html` | UI: ปุ่ม Capture เดี่ยว (มีฟอร์มให้กรอก `modelSlugs`/`category`/`isUniversal` ก่อนบันทึก) และปุ่ม Auto Scan (ข้ามฟอร์มพวกนี้ไปเลย เพื่อความเร็ว) |

**Auto-scan mode** (ที่ใช้จริงตอนนี้) → เร็ว แต่ไม่กรอก brand/category/fitment
**Manual capture mode** (มีอยู่แล้วแต่แทบไม่ได้ใช้) → ช้ากว่า แต่กรอก category/isUniversal/modelSlugs ได้ตอน capture เลย

**Affiliate link:** generate ผ่าน `affiliate.shopee.co.th` (พอร์ทัลของ Shopee เอง) — **ไม่ใช่ Involve Asia, ไม่มีลิมิตจำนวนลิงก์ต่อเดือน** (confirm แล้วจาก CEO) — ต่างจากที่เข้าใจตอนแรก

---

## 3. สถาปัตยกรรมที่เสนอ

### 3.1 Fitment matching
- ใช้ `product_model_mapping` (product_id ↔ model_slug) ตามที่ schemaออกแบบไว้แล้ว — ไม่ต้องเพิ่ม column ใหม่
- `is_universal=true` → ไม่ต้องมี mapping แถวไหนเลย (ใส่ได้ทุกรุ่น)
- Alias resolution: ใช้ `model_aliases` แปลงคำเพี้ยน/ชื่อเล่น → `model_slug` จริง ก่อน insert mapping (ทั้งตอน clean ข้อมูลและตอน UI ให้ลูกค้าพิมพ์ค้นหา)

### 3.2 Shop page UX (ตัวเลือกที่ 3 — ผสม)
- Filter bar ด้านบน: dropdown/search "รถของคุณคือ..." (ใช้ alias dictionary auto-complete) — เลือกแล้วกรอง grid เหลือเฉพาะ is_universal + สินค้าที่ map กับ slug นั้น
- ไม่เลือกก็เดินดูได้อิสระ ตามหมวด (`category`) เหมือนเว็บ e-commerce ปกติ
- แต่ละการ์ดสินค้าโชว์ badge รุ่นที่ใส่ได้ (หรือ "ใส่ได้ทุกรุ่น" ถ้า universal)

### 3.3 Review gate (ใช้ pattern เดียวกับ Trip page ที่พิสูจน์แล้วว่าเวิร์ค)
- `status`: เสนอใช้ค่า `pending` (รอตรวจ) → `active` (ขึ้นเว็บ) → `archived` (ปิดขาย) แทนการเพิ่ม column ใหม่
- หน้า Shop public query เฉพาะ `status='active'` (RLS policy เหมือน trip_routes)
- Admin dashboard (ต่อยอด `Craftbikelab-Admin.html`) เพิ่มแท็บ "สินค้า" คล้ายแท็บทริปที่ทำไปแล้ว — ตาราง + filter status + ฟอร์ม assign model fitment

### 3.4 Image pipeline (ต้องสร้างใหม่ — ยังไม่เคยมี)
1. `imageUrl` ที่ extension capture มาแล้ว (Shopee CDN URL สด) อยู่ใน sheet ทุกแถวอยู่แล้ว — ไม่ต้อง scrape ซ้ำ
2. Script ดาวน์โหลดรูปจาก URL ที่มีอยู่ → upload เข้า Cloudflare R2 bucket ใหม่ (`craftbikelab-shop-images` หรือชื่อที่ตกลง) → ได้ URL ถาวร
3. เขียน URL ใหม่ลง `image_urls` jsonb array
4. รันเป็น batch job แยกจาก schema อื่น ไม่ต้องรอ realtime

### 3.5 Deeplink / affiliate link — ใช้ extension ที่มีอยู่แล้ว ไม่มีลิมิต
- Extension generate ผ่าน `affiliate.shopee.co.th` โดยตรง (พอร์ทัลของ Shopee เอง) — **ไม่มีลิมิตจำนวนลิงก์/เดือน** (confirm แล้ว) เป็นเครื่องมือหลักต่อไป ไม่ต้องหาทางเลือกอื่น
- **ความเสี่ยงเดียวที่ต้องระวัง:** `content_affiliate.js` จำลองคลิกบน DOM จริงของหน้า Shopee (`textarea.ant-input`, `button.ant-btn-primary`) — ถ้า Shopee เปลี่ยน UI/library (Ant Design) ส่วนนี้จะพังทันที ต้องมี fallback/แจ้งเตือนเมื่อ selector หาไม่เจอ (ตอนนี้ throw error ชัดเจนอยู่แล้ว แต่ควรมีการแจ้ง CEO ทันทีถ้าพังบ่อย)
- ปัญหาที่ต้องแก้จริง: category/brand/model_slugs ยังว่างเพราะ auto-scan ข้าม field พวกนี้ — ต้องเพิ่ม**ขั้นตอนเสริมหลัง capture** (ดู P2) ไม่ใช่แก้ที่ deeplink

---

## 4. แผนขั้นตอน (Phased)

| Phase | งาน | Output |
|---|---|---|
| **P1 — Data foundation** | คลีน alias dictionary (ตัดขยะ, เก็บ pattern ถูกต้อง, ขยายให้ครอบคลุมรุ่นเก่า+ครบทุกระดับราคา) + เติม Wave100 ฯลฯ ใน master list + seed `models` table จริง | `models` + `model_aliases` มีข้อมูลสะอาดพร้อมใช้ |
| **P2 — Product cleanup** | คลีน 91 แถวใน `CBL_Affiliate_Pipeline` sheet: เติม brand (parse จากชื่อ), category, fitment (ผ่าน alias matching จาก P1) ที่ auto-scan ข้ามไป — ตัดสินใจว่าจะทำมือ/กึ่ง AI/บังคับใช้ manual capture mode ต่อไป | draft `affiliate_products` (status=pending) + `product_model_mapping` |
| **P3 — Image pipeline** | สร้าง script โหลด Shopee image → upload R2 → อัปเดต `image_urls` | รูปสินค้าถาวรไม่พึ่ง Shopee CDN |
| **P4 — Admin extend** | เพิ่มแท็บ "สินค้า" ใน Admin dashboard: review pending, assign/edit fitment, ใส่ deeplink จาก extension, publish | Admin ตรวจ+publish สินค้าได้ครบ |
| **P5 — Shop page (public)** | สร้างหน้า Shop จริงแทน iframe เดิม: filter bar เลือกรุ่นรถ + grid ตามหมวด + badge fitment | หน้า Shop ใช้งานได้จริงบน production |
| **P6 — Hardening** | RLS policy บน 3 ตารางใหม่ (เหมือนที่ทำกับ trip_routes), quality gate ก่อน publish, ทดสอบ end-to-end | ปลอดภัย + verify จริงก่อนขึ้นเว็บ |

---

## 5. ความเสี่ยง/จุดที่ต้องตัดสินใจเพิ่มเติมระหว่างทาง

1. **category/brand/fitment ยังต้องมีคนกรอก** — auto-scan ไม่ทำให้อัตโนมัติ ต้องตัดสินใจ workflow: กลับไปใช้ manual capture mode (ช้าลงแต่ข้อมูลครบ) หรือเขียน AI enrichment step แยกทำงานกับ sheet หลัง auto-scan เสร็จ
2. **`content_affiliate.js` เปราะบางต่อการเปลี่ยน DOM ของ Shopee** — ถ้า Shopee อัปเดต UI (Ant Design class เปลี่ยน) ระบบ generate link จะพังทันที ต้องมี monitoring/แจ้งเตือน
3. **Cloudflare R2 credentials** — ยังไม่เช็คว่ามี R2 bucket + API token พร้อมใช้จริงหรือยัง (ต้อง verify ก่อนเริ่ม P3)
4. **Legacy bike data (Wave100 ฯลฯ)** — ต้องหาแหล่งข้อมูลรุ่นเก่าเพิ่ม (ไม่มีในชีตปัจจุบันเลย)
5. **`brand` field ไม่เคยถูก capture เลย** — `content_shopee.js` ดึงแค่ title/price/image/link ไม่ได้ parse brand จากชื่อสินค้าอัตโนมัติ ต้องเพิ่ม logic parse หรือกรอกมือ

---

*ไฟล์นี้เป็นแผนที่ CEO confirm ทิศทางแล้ว (2026-07-14) — extension เป็นเครื่องมือหลัก ไม่มีลิมิตลิงก์ พร้อมเริ่ม Phase 1*
