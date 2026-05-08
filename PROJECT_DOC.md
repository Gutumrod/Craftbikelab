# 📋 CRAFTBIKELAB — Project Document v2.0

**Domain:** www.craftbikelab.com  
**วันที่จัดทำ:** 28 เมษายน 2025  
**เจ้าของโปรเจค:** คุณฟรี

---

## 🎯 Vision & Brand

> **"ห้องทดลองของคนรักรถ (The Lab for Bike Lovers)"**  
> Creative North Star: **"The Midnight Apex"**

**Persona:** Craftbikelab — จริงใจ, คุยสนุก, ตัวจริงเรื่องอะไหล่ตรงรุ่น  
**Core Promise:** ซื้อของแต่งจากเราแล้วใส่รถได้แน่ 100%

### Design System: Kinetic Velocity
| | Token | Hex |
|-|-------|-----|
| 🔵 Primary | Neon Blue | `#69daff` |
| 🔴 Secondary | Racing Red/Orange | `#ff7350` |
| ⬛ Background | Deep Black | `#0e0e0e` |
| 🟫 Surface | Container | `#1a1a1a` – `#2c2c2c` |

**Fonts:** Space Grotesk (Headlines) + Manrope (Body) + Noto Sans Thai  
**Style:** High-performance cockpit, Asymmetric layout, Glassmorphism, No 1px borders  
**ไฟล์อ้างอิง:** `engine/data/4. ดีไซน์หลัก (Brand & UI Design)/`
- `DESIGN.md` — Design System ครบถ้วน
- `code.html` — HTML prototype พร้อมใช้งาน

---

## 🏛️ โครงสร้างหน้าเว็บ

**Strategy:** เริ่มจาก Domain หลัก (`craftbikelab.com`) ก่อน เพิ่มหน้าทีละหน้า พอครบแล้วค่อยแยก Subdomain

| ลำดับ | หน้า | URL ตอนนี้ | Subdomain (อนาคต) | Monetize |
|-------|------|-----------|-------------------|---------|
| 1 | **Shop** | craftbikelab.com/shop | shop.craftbikelab.com | ✅ Affiliate หลัก |
| 2 | **Trip** | craftbikelab.com/trip | trip.craftbikelab.com | Sponsorship |
| 3 | **News** | craftbikelab.com/news | — | — |
| 4 | **Craft** | craftbikelab.com/craft | craft.craftbikelab.com | ✅ Affiliate Bundle |
| — | **Index** | craftbikelab.com | — | ทางอ้อม |

> Navigation bar ด้านบนเชื่อมทุกหน้าไว้แล้วในโค้ด  
> ⚠️ **กฎเหล็ก Trip & News:** ห้ามมีสินค้า/โปรโมท Shop หรือ Craft เด็ดขาด

---

## 📄 รายละเอียดแต่ละหน้า

### 🏠 Index (หน้าแรก)
- แสดงราคาน้ำมันปัจจุบัน (real-time)
- รวม highlight จาก Shop / Build / Trip / News
- ประตูแรกที่ลูกค้าเห็น

### 🛒 Shop
- การ์ดสินค้าของแต่งมอเตอร์ไซค์ มีรูป, ชื่อ, รายละเอียด, **รุ่นรถที่ใส่ได้**
- ปุ่มกดตรงไปยัง Shopee / Lazada / TikTok ผ่าน affiliate link
- แบ่งเป็น: สินค้าขายดี / สินค้าแนะนำ / สินค้าอื่นๆ
- **Core Moat:** Normalizer + Alias Dataset (2,000+ entries) กรองให้ตรงรุ่น

### 🔧 Craft
- ลูกค้ากรอก: รุ่นรถ + งบประมาณ + สไตล์ที่ชอบ
- ระบบดึงสินค้าจาก Shop แนะนำของแต่งรอบคันตามงบ
- แบ่งเกรด: Entry / Mid-tier / High-end
- เช็ค Compatibility เสมอ
- ⏸️ **ยังไม่ตัดสินใจ:** AI หรือ Logic ธรรมดา (กังวลค่า API)

### 🗺️ Trip
- รีวิวเส้นทางท่องเที่ยวแบบ End-to-End (ทางชิล, ทางลุย, Custom)
- การ์ดเส้นทาง พร้อม Google Maps link เดียว (ต้นทาง + ปลายทาง + waypoints)
- แนะนำจุดแวะพัก, ที่พัก, ร้านอาหาร
- รับส่งเส้นทางจากผู้ใช้ (Line OA / Email / Facebook Page) พร้อมรูป + ให้เครดิต
- Business Model: Sponsorship (ที่พัก, ร้านอาหาร, สถานที่)

### 📰 News
- ข่าววงการสองล้อ เก็บเฉพาะช่วง 1 เดือนล่าสุด
- การ์ดข่าวใหญ่ 2-3 ข่าว + การ์ดเล็ก 10-15 การ์ด
- ไม่มีของแต่ง / Shop ปนเด็ดขาด

---

## 🛠️ Tech Stack

| ส่วน | เทคโนโลยี | สถานะ |
|------|-----------|-------|
| Frontend | Next.js (App Router) | 🟡 โครงสร้างมีแล้ว ยังไม่ได้ connect จริง |
| Deploy | Vercel | 🟡 project มีแล้ว รอ connect |
| Database | Supabase (PostgreSQL) | ✅ มี data บางส่วน |
| Alt Database | Neon DB (PostgreSQL) | ⏸️ มีแล้ว ยังไม่ได้เลือกว่าจะใช้ตัวไหน |
| Admin Panel | HTML + Supabase JS SDK | ✅ ใช้งานได้ |
| Image Storage | Cloudflare R2 | 🔴 ยังไม่ได้ทำ |
| Automation | n8n | 🟡 กำลังพัฒนา |
| Affiliate | Involve Asia (ยืนยันแล้ว) | ✅ พร้อม |
| Fuel Price API | Bangchak API (real-time) | ✅ ทำงานอยู่ |
| HTML Mockups | GitHub Pages (design reference) | ✅ ใช้เป็น UI blueprint เท่านั้น |

---

## 💰 Business Model

| แหล่งรายได้ | ช่องทาง | สถานะ |
|------------|---------|-------|
| Affiliate Commission | Involve Asia | ✅ ยืนยัน Partner แล้ว |
| Affiliate Commission | Accesstrade | วางแผนไว้ |
| Affiliate Commission | Shopee / Lazada / TikTok | วางแผนไว้ |
| Sponsorship | Trip (ที่พัก, ร้านอาหาร) | ⏸️ Phase ต่อไป |

---

## 🧠 Craftbikelab Engine (Core System)

นี่คือ **ความได้เปรียบหลัก (Moat)** ของโปรเจค

### Search & Normalizer Pipeline
```
User Query (ภาษาพูด เช่น "ฟอซ่า", "นินจา")
    ↓
Normalizer (lowercase, ตัดอักขระ)
    ↓
Alias Dataset (2,000+ entries)
    ↓
Canonical Model (ชื่อมาตรฐาน)
    ↓
Database Query (360 รุ่นรถ)
    ↓
Ranking → แสดงผล
```

### ข้อจำกัด Normalizer ปัจจุบัน
- ทำแค่ lowercase + remove special chars
- ❌ ยังไม่มี tokenizer
- ❌ ยังไม่มี stopwords
- ❌ ยังไม่มี fuzzy matching

### ฐานข้อมูลที่มีอยู่แล้ว
| ไฟล์ | รายละเอียด |
|------|-----------|
| `motorcycle_alias_2000.csv` | 2,000 aliases ภาษาไทย/อังกฤษ |
| `thailand_motorcycle_dataset_300.xlsx` | 300 รุ่นรถ |
| `Bike Database.xlsx` | ฐานข้อมูลรถ |

---

## 🤖 AI Tools ที่ใช้งานอยู่ตอนนี้

| Tool | หน้าที่ | สถานะ |
|------|---------|-------|
| Gemini + NotebookLM | Knowledge base รวม 36 ไฟล์โปรเจค | 🟡 มีแต่ไม่ได้อัพเดทแล้ว |
| Hermes / Openclaw | AI Agent ช่วยงาน | 🔴 เพิ่งติดตั้ง ยังไม่ได้ใช้ |
| Claude Code / Codex / Gemini CLI | งานเทคนิค / เขียนโค้ด | ✅ ใช้งานอยู่ |
| AI ใน n8n | Normalize ชื่อสินค้า | 🔴 ไม่เสถียร |

---

## 🚧 Data Pipeline (เส้นทางข้อมูลสินค้า)

> รายละเอียดเต็มอยู่ใน **[SHOP_PIPELINE.md](./SHOP_PIPELINE.md)**

```
Bigsaler xlsx → Merge Variants → Clean → AI Enrich → Deeplink → R2 Upload → Supabase
```

| ชีท Google Sheets | หน้าที่ |
|-------------------|---------|
| Supabase Import Sheet | Template สำหรับ import เข้า DB (มีแค่ header ยังไม่มีข้อมูล) |
| Assembly Line (A–I) | ควบคุม workflow การทำสินค้า (วางแผนไว้ ยังไม่ได้ทำ) |

---

## 📁 โครงสร้าง Local

```
D:\Craftbikelab-Project\          ← โปรเจคหลัก (clean)
├── web/                          ← Next.js frontend (deploy บน Vercel)
│   ├── app/
│   │   ├── page.tsx              ← Index
│   │   ├── shop/page.tsx         ← Shop
│   │   ├── craft/page.tsx        ← Craft
│   │   ├── trip/page.tsx         ← Trip
│   │   └── news/page.tsx         ← News
│   └── ...
├── engine/
│   ├── data/
│   │   └── 4. ดีไซน์หลัก (Brand & UI Design)/
│   │       ├── index.html        ← mockup Index (UI blueprint)
│   │       ├── Shop.html         ← mockup Shop (UI blueprint)
│   │       ├── Craft.html        ← mockup Craft (UI blueprint)
│   │       ├── Trip.html         ← mockup Trip (UI blueprint)
│   │       ├── News.html         ← mockup News (UI blueprint)
│   │       ├── Craftbikelab-Admin.html ← Admin panel ✅ ใช้งานได้จริง
│   │       └── DESIGN.md         ← Design System ครบถ้วน
│   ├── ai_processor.py           ← Gemini AI (ยังไม่ได้ใช้งานจริง)
│   ├── supabase_manager.py       ← ✅ ใช้งานได้
│   ├── r2_manager.py             ← Cloudflare R2 (ยังไม่ได้ทดสอบ)
│   ├── main_worker.py
│   └── schema.sql                ← DB schema
└── PROJECT_DOC.md                ← ไฟล์นี้

D:\CraftBikeLab\                  ← โฟลเดอร์ raw/working
├── ข้อมูล/                       ← เอกสารวางแผน, dataset, blueprint
├── Content/                      ← Trip content, Build components
├── Teext Edit/                   ← บันทึกประจำวัน, คำสั่งงาน
├── รวมรวมสินค้า/                  ← xlsx สินค้า (Bigsaler)
├── หลังบ้าน/                     ← Backend prototype (Hono + Drizzle)
├── Normalizer Update/            ← normalizer.ts ฉบับปรับปรุง
└── Search Results Page/          ← UI Search Results
```

---

## 🔗 Links สำคัญ

| ชื่อ | URL |
|-----|-----|
| เว็บไซต์ (ยัง 404) | https://www.craftbikelab.com |
| Vercel project | https://vercel.com/titazmth-8430s-projects/craftbikelab-shop |
| Supabase | https://ujviscxkvlwputrsfhxn.supabase.co |
| Neon DB | https://console.neon.tech/app/projects/summer-band-42245308 |
| GitHub Pages (mockup / UI blueprint) | https://gutumrod.github.io/Craftbikelab/ |

---

## 📊 สถานะปัจจุบัน

### ✅ ทำแล้ว / มีแล้ว
- Domain จดแล้ว (Hostinger)
- Involve Asia — ยืนยันเป็น Affiliate Partner แล้ว
- HTML mockup ครบทุกหน้า (index, shop, craft, trip, news, admin) — ขึ้น GitHub Pages แล้ว
- Design System "Kinetic Velocity" ออกแบบครบ
- Python engine ครบ (supabase_manager, r2_manager, ai_processor)
- Database schema ออกแบบแล้ว (schema.sql)
- Supabase มี data บางส่วน (import CSV ได้)
- Alias Dataset 2,000+ entries พร้อมใช้
- Motorcycle dataset 300+ รุ่น

### 🔴 Blockers
- **[BLOCKER #1]** n8n normalize ไม่เสถียร — AI บื้อ / flow เพี้ยน → ข้อมูลสินค้าเข้า Supabase ไม่ได้ครบ
- **[BLOCKER #2]** Cloudflare R2 upload — ยังไม่เคยทำเลย → ยังไม่มีรูปสินค้า
- **[BLOCKER #3]** Shop.html ยังเป็น mockup (hardcode) — ยังไม่ได้เชื่อม Supabase จริง
- เว็บ craftbikelab.com ยัง 404 — ยังไม่ได้ deploy หน้าจริง

### ⏸️ ยังไม่ตัดสินใจ
- Build/Craft page — AI หรือ Logic ธรรมดา?

---

## 🎯 เป้าหมายตอนนี้ — เปิดหน้า Shop ให้ได้

> **"ต้องหาเงินมาเข้าโปรเจคก่อน"** — หน้า Shop คือ Priority #1 เท่านั้น

### สิ่งที่ต้องทำให้ Shop ขึ้น live ได้

1. **แก้ n8n normalize ให้เสถียร** → ข้อมูลสินค้าถูกต้องก่อน
2. **ทำ R2 upload pipeline** → มีรูปสินค้าก่อน
3. **ทดสอบ pipeline ครบวงจร** → xlsx → normalize → R2 → Supabase
4. **Build หน้า Shop ใน Next.js จริง** → เอา design จาก Shop.html มา implement ดึงข้อมูลจาก Supabase
5. **Deploy ขึ้น Vercel + ชี้ Domain** → craftbikelab.com มีชีวิต มีสินค้า มี affiliate link

### หลังจาก Shop มีรายได้แล้วค่อยทำ
- Trip → News → Craft (ตามลำดับ)
- Fitment Engine + Normalizer อัพเกรด
- แยก Subdomain

---

*อัพเดทล่าสุด: 28 เมษายน 2026*
