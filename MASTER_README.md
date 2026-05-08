# 🏍️ CRAFTBIKELAB — Full-Stack Platform for 500K Motorcycle Products

**Production-ready platform for processing, storing, and browsing 500,000+ motorcycle accessories/parts**

Combines:
- 🤖 **Google Gemini AI** for product extraction
- 📦 **Supabase** for database (PostgreSQL)
- 🖼️ **Cloudflare R2** for image storage
- ⚡ **Async Python** for high-performance data pipeline
- 🌐 **Next.js 14** for web frontend
- 🔍 **Fitment Engine** for motorcycle model search

---

## 📁 Project Structure

```
craftbikelab/
├── schema.sql                    # Supabase database schema (RUN FIRST!)
├── r2_manager.py                 # Cloudflare R2 image storage
├── supabase_manager.py           # Supabase database operations
├── ai_processor.py               # Gemini AI product extraction
├── main_worker.py                # Master orchestrator
├── .env.template                 # Environment variables template
│
├── web/                          # Next.js Frontend
│   ├── app/
│   │   ├── page.tsx              # Homepage
│   │   └── search/
│   │       ├── page.tsx          # Search Results (Server Component)
│   │       └── SearchResultsClient.tsx  # Search UI (Client Component)
│   └── lib/
│       └── utils/
│           ├── normalizer.ts     # Motorcycle model normalizer
│           └── normalizer.test.ts
│
└── engine/
    └── data/                     # Module Specs & Documentation
        ├── 2. ไฟล์แยกตามโมดูล/
        │   └── 2.2_Fitment_Engine/
        │       ├── SEARCH_PAGE_GUIDE.md
        │       └── NORMALIZER_UPDATE.md
        └── 4. ดีไซน์หลัก/
            └── DESIGN.md
```

---

## 🚀 Quick Start

### Backend (Python Pipeline)

#### 1️⃣ Prerequisites

```bash
# Python 3.10+
python --version

# Install dependencies
pip install supabase boto3 aiohttp google-generativeai python-dotenv
```

#### 2️⃣ Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Copy-paste entire `schema.sql` file
4. Click **Run**
5. Verify tables created in Table Editor

#### 3️⃣ Cloudflare R2 Setup

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **R2**
2. Create bucket (e.g., `craftbikelab-products`)
3. Go to **Manage R2 API Tokens** → **Create API Token**
4. Permissions: **Object Read & Write**
5. Save **Access Key ID** and **Secret Access Key**

**Public Access Option A: Custom Domain** (Recommended)
- R2 Bucket → Settings → Custom Domains
- Add: `img.craftbike.com`
- Follow DNS setup instructions

**Public Access Option B: Public Bucket**
- R2 Bucket → Settings → Public Access
- Enable public access
- URL format: `https://pub-HASH.r2.dev`

#### 4️⃣ Google Gemini API

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API Key
3. Copy the key

#### 5️⃣ Environment Variables

```bash
# Copy template
cp .env.template .env

# Edit .env with your actual credentials
nano .env
```

Fill in all values:
- `SUPABASE_URL` and `SUPABASE_KEY`
- `R2_ENDPOINT`, `R2_ACCESS_KEY`, `R2_SECRET_KEY`, `R2_BUCKET`, `R2_PUBLIC_DOMAIN`
- `GEMINI_API_KEY`

#### 6️⃣ Run Pipeline

```bash
python main_worker.py
```

---

### Frontend (Next.js Web App)

#### 1️⃣ Install Dependencies

```bash
cd web
npm install
```

#### 2️⃣ Environment Variables

```bash
# สร้างไฟล์ .env.local ใน web/
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 3️⃣ Run Dev Server

```bash
npm run dev
# เปิด http://localhost:3000
```

---

## 🏗️ Architecture

### Full System Overview

```
[Data Sources]
  URLs / Text Input
       ↓
┌─────────────────────────────┐
│  Python Backend Pipeline    │
│                             │
│  1. AI Processor (Gemini)   │ → Extract product data
│     - Name, brand, price    │
│     - Category, models      │
│     - Image URLs            │
│                             │
│  2. R2 Manager              │ → Upload images
│     - Async download        │
│     - S3 upload w/ retry    │
│     - Generate public URLs  │
│                             │
│  3. Supabase Manager        │ → Store data
│     - Bulk upsert (500)     │
│     - Model mapping         │
│     - Storage monitoring    │
└─────────────────────────────┘
       ↓
┌─────────────────────────────┐
│  Supabase (PostgreSQL)      │ ← Single source of truth
└─────────────────────────────┘
       ↓
┌─────────────────────────────┐
│  Next.js Frontend           │
│                             │
│  1. Normalizer              │ → แปลงชื่อรุ่นรถ
│     'nแม็ก' → 'nmax155'    │
│                             │
│  2. Search Page             │ → Filter, Sort, Responsive
│     /search?q=pcx160        │
│                             │
│  3. Product Cards           │ → แสดงสินค้า + รูปภาพ
└─────────────────────────────┘
```

### Database Schema

**affiliate_products** (Main table)
- `id` (BIGSERIAL) — Product ID
- `name`, `brand`, `category`, `price`, `status`
- `shopee_link`, `lazada_link`, `tiktok_link` (Unique constraints)
- `image_urls` (JSONB) — Array of R2 URLs
- `compatible_models` (ARRAY) — รุ่นรถที่ใส่ได้ เช่น `['pcx160', 'nmax155']`
- `metadata` (JSONB) — AI-extracted data

**product_model_mapping** (Many-to-Many)
- `product_id` → `affiliate_products.id`
- `model_slug` → Motorcycle model (e.g., `adv350`)

**model_aliases** (Helper table)
- `alias` → `model_slug` mapping

---

## 🔍 Fitment Engine (Search System)

ระบบค้นหาสินค้าตามรุ่นรถ — ผู้ใช้พิมพ์ชื่อรถ แล้วระบบแสดงอะไหล่/อุปกรณ์ที่ใส่ได้

### URL Structure

```
/search?q=pcx160
/search?q=pcx160&category=exhaust
/search?q=pcx160&category=suspension&brand=YSS
/search?q=pcx160&category=exhaust&sort=price_asc
```

### Categories

| ID | ชื่อหมวด |
|----|---------|
| `suspension` | ระบบช่วงล่าง |
| `exhaust` | ท่อไอเสีย |
| `body` | ชุดแต่ง & สี |
| `brake` | ระบบเบรก |
| `lighting` | ไฟและไฟฟ้า |

### Brands ที่รองรับ

```
YSS, Akrapovic, Brembo, Enkei, Givi, RIZING,
Yoshimura, KYB, Ohlins, NGK, Bosch
```

### Sort Options

| Value | Label |
|-------|-------|
| `relevance` | เกี่ยวข้องที่สุด |
| `price_asc` | ราคา: ต่ำ → สูง |
| `price_desc` | ราคา: สูง → ต่ำ |
| `rating` | คะแนนสูงสุด |
| `newest` | ล่าสุด |

---

## 🔧 Normalizer (`lib/utils/normalizer.ts`)

ระบบแปลงชื่อรุ่นรถจากภาษาพูด/พิมพ์ผิด → ชื่อมาตรฐาน

### รองรับ 230+ aliases, 65+ รุ่น

| Brand | จำนวนรุ่น | Aliases |
|-------|----------|---------|
| **Honda** | 20 | 80+ |
| **Yamaha** | 15 | 60+ |
| **Kawasaki** | 13 | 40+ |
| **Royal Enfield** | 3 | 10+ |
| **Ducati** | 5 | 15+ |
| **BMW** | 4 | 12+ |
| **Suzuki** | 4 | 10+ |
| **GPX** | 1 | 3+ |

### ตัวอย่างการใช้งาน

```typescript
import { normalizeModelName, isKnownModel, getDisplayName } from '@/lib/utils/normalizer';

normalizeModelName('nแม็ก')       // → 'nmax155'
normalizeModelName('pcx ตัวเก่า') // → 'pcx150'
normalizeModelName('adv ตัวเล็ก') // → 'adv160'
normalizeModelName('ฟอซ่า')       // → 'forza350'
normalizeModelName('นินจา400')    // → 'ninja400'

isKnownModel('nmax155')           // → true
getDisplayName('nmax155')         // → 'Yamaha NMAX 155'
getDisplayName('pcx160')          // → 'Honda PCX 160'
```

### Test Cases

```bash
npx ts-node lib/utils/normalizer.test.ts
# ✅ 50/50 test cases passed
```

> ดูรายละเอียดเพิ่มเติม: `engine/data/2. ไฟล์แยกตามโมดูล/2.2_Fitment_Engine/NORMALIZER_UPDATE.md`

---

## 🎨 Design System

ธีม: **"Kinetic Velocity / The Midnight Apex"** — High-performance cockpit สำหรับนักบิดมืออาชีพ

**สีหลัก:**
- Neon Blue: `#69daff` (Primary), `#00cffc` (Container)
- Racing Red: `#ff7350` (Secondary), `#b42800` (Container)
- Surface: `#0e0e0e` (Background), `#1a1a1a`–`#2c2c2c` (Cards)

**Typography:**
- Headlines: `Space Grotesk` — aggressive, compact
- Body: `Manrope` — clean, legible

**กฎสำคัญ:**
- ห้ามใช้ 1px solid border — ใช้ background shift แทน
- ใช้ Glassmorphism สำหรับ floating elements (60% opacity + 20px blur)
- ใช้ gradient `primary → primary_container` at 135° สำหรับ CTA buttons

> ดูรายละเอียดเพิ่มเติม: `engine/data/4. ดีไซน์หลัก/DESIGN.md`

---

## 📖 Usage (Python Pipeline)

### Process from List

```python
import asyncio
from main_worker import MainWorker

async def process_products():
    worker = MainWorker()
    
    products = [
        "https://shopee.co.th/SW-Motech-EVO-Crash-Bar-Honda-ADV350",
        "Yoshimura R77 Full Exhaust CBR650R",
        "กระเป๋าข้าง GIVI Yamaha XMAX 300"
    ]
    
    await worker.run(input_list=products)

asyncio.run(process_products())
```

### Process from File

```bash
echo "https://shopee.co.th/product/123" > products.txt
echo "https://lazada.co.th/product/456" >> products.txt
```

```python
import asyncio
from main_worker import MainWorker

async def process_from_file():
    worker = MainWorker()
    await worker.run(input_file="products.txt")

asyncio.run(process_from_file())
```

---

## ⚙️ Configuration

### Batch Size

```python
# supabase_manager.py
BATCH_SIZE = 500  # Adjust based on your network

# main_worker.py
await worker.process_batch(products, batch_size=500)
```

### Concurrency

```python
# main_worker.py
self.semaphore = asyncio.Semaphore(10)  # Max 10 concurrent tasks
```

### Rate Limiting

```python
# ai_processor.py
MAX_RPM = 60  # Gemini Flash limit
```

---

## 📊 Monitoring

### Storage Usage

```python
from supabase_manager import SupabaseManager

manager = SupabaseManager()
stats = manager.estimate_storage_usage()

print(stats)
# {
#   'product_count': 45000,
#   'estimated_mb': 245.8,
#   'usage_percent': 49.2,
#   'needs_upgrade': False
# }
```

### Supabase Limits

| Tier | Storage | Price |
|------|---------|-------|
| **Free** | 500 MB | $0 |
| **Pro** | 8 GB | $25/month |

**Estimates:**
- 50,000 products ≈ 350 MB
- 100,000 products ≈ 700 MB (upgrade needed)
- 500,000 products ≈ 3.5 GB (Pro plan)

---

## 🔧 Troubleshooting

### Backend
| Error | Solution |
|-------|----------|
| "Missing R2 environment variables" | Check `.env` has all `R2_*` variables |
| "Image upload failed" | Verify R2 bucket permissions and public access |
| "Rate limit reached" | Gemini has 60 RPM limit, auto-wait will trigger |
| "Database near limit" | Upgrade to Pro or clean up old data |

### Frontend
| Error | Solution |
|-------|----------|
| Search returns no results | ตรวจสอบ `compatible_models` column ใน Supabase |
| Normalizer ไม่แปลงชื่อ | เพิ่ม alias ใน `normalizer.ts` |
| URL ไม่อัพเดทเมื่อ filter | ตรวจสอบ `updateURL()` function ใน `SearchResultsClient.tsx` |

---

## 🎯 Performance

**Python Pipeline (tested):**
- ✅ 10,000 products in ~15 minutes
- ✅ 50,000 products in ~1.5 hours
- ✅ 500,000 products in ~15 hours

**Bottlenecks:**
1. Gemini API (60 RPM) — 1 req/second
2. Network speed for image downloads
3. Supabase bandwidth (Free: 2GB/month)

---

## 📝 License

MIT License — Feel free to use for your projects!

---

## 🤝 Credits

Built with ❤️ for Craftbikelab  
- Powered by Supabase, Cloudflare, Google Gemini, and Next.js
