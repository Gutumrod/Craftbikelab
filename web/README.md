# 🌐 Craftbikelab Web — Next.js Frontend

**หน้าเว็บสำหรับค้นหาอะไหล่/อุปกรณ์แต่งรถมอเตอร์ไซค์ตามรุ่นรถ**

- Framework: **Next.js 14** (App Router)
- Styling: **Tailwind CSS**
- Database: **Supabase** (PostgreSQL)
- Language: **TypeScript**

---

## 🚀 Quick Start

```bash
npm install
npm run dev
# เปิด http://localhost:3000
```

---

## 📁 Structure

```
web/
├── app/
│   ├── page.tsx                    # Homepage
│   └── search/
│       ├── page.tsx                # Search Results (Server Component)
│       └── SearchResultsClient.tsx # Search UI + Filter (Client Component)
└── lib/
    └── utils/
        ├── normalizer.ts           # Motorcycle model name normalizer
        └── normalizer.test.ts      # 50 test cases
```

---

## 🔍 Search Page

URL: `/search?q=pcx160`

### Query Parameters

| Parameter | ตัวอย่าง | คำอธิบาย |
|-----------|---------|---------|
| `q` | `pcx160`, `nmax155` | ชื่อรุ่นรถ (required) |
| `category` | `exhaust`, `suspension` | หมวดหมู่สินค้า |
| `brand` | `YSS`, `Akrapovic` | แบรนด์สินค้า |
| `sort` | `price_asc`, `rating` | เรียงลำดับผลลัพธ์ |

### ตัวอย่าง URL

```
/search?q=pcx160
/search?q=nmax155&category=exhaust
/search?q=adv350&brand=Givi&sort=price_asc
```

---

## 🔧 Normalizer

ไฟล์: `lib/utils/normalizer.ts`

แปลงชื่อรุ่นรถจากที่ผู้ใช้พิมพ์ → ชื่อมาตรฐานสำหรับ query ใน Supabase

```typescript
import { normalizeModelName, isKnownModel, getDisplayName } from '@/lib/utils/normalizer';

normalizeModelName('nแม็ก')       // → 'nmax155'
normalizeModelName('pcx ตัวเก่า') // → 'pcx150'
normalizeModelName('adv ตัวเล็ก') // → 'adv160'
normalizeModelName('ฟอซ่า')       // → 'forza350'

isKnownModel('nmax155')           // → true
getDisplayName('nmax155')         // → 'Yamaha NMAX 155'
```

รองรับ **230+ aliases**, **65+ รุ่น**, จาก 8 แบรนด์ (Honda, Yamaha, Kawasaki, Ducati, BMW, Suzuki, Royal Enfield, GPX)

### ทดสอบ Normalizer

```bash
npx ts-node lib/utils/normalizer.test.ts
```

---

## 🗄️ Supabase Integration

### เปิดใช้งาน Real Data

ใน `SearchResultsClient.tsx` ให้ uncomment Supabase query และลบ mock data:

```typescript
const supabase = createClient();

const { data, error } = await supabase
  .from('products')
  .select('*')
  .contains('compatible_models', [normalizedQuery])
  .order('created_at', { ascending: false });
```

### Database Query ตัวอย่าง

```sql
-- ค้นหาสินค้าตามรุ่นรถ + หมวดหมู่
SELECT * FROM products
WHERE compatible_models @> ARRAY['pcx160']
  AND category = 'exhaust'
ORDER BY price ASC;
```

---

## 🎨 Design System

ธีม: **"Kinetic Velocity"** — dark mode สไตล์ high-performance cockpit

| Token | ค่า | ใช้งาน |
|-------|-----|-------|
| Background | `#0e0e0e` | Surface หลัก |
| Card | `#131313` | Content cards |
| Primary | `#69daff` | Accent, CTA |
| Secondary | `#ff7350` | Alert, high-energy actions |
| Text | `#ffffff` | on_surface |
| Muted | `zinc-400` | Body text |

**กฎสำคัญ:** ห้ามใช้ 1px solid border — ใช้ background shift แทน  
ดูรายละเอียดเต็ม: `../engine/data/4. ดีไซน์หลัก/DESIGN.md`

---

## 🔌 Environment Variables

สร้างไฟล์ `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## 📦 Build & Deploy

```bash
# Build
npm run build

# Deploy บน Vercel (recommended)
vercel deploy
```

---

## 🗺️ Roadmap

- [ ] เชื่อมต่อ Supabase จริง (ตอนนี้ใช้ Mock Data)
- [ ] Pagination / Load More
- [ ] Price Range Filter
- [ ] Grid / List View Toggle
- [ ] Fuzzy Search (Levenshtein Distance)
