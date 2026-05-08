# 🔧 SHOP_PIPELINE — เส้นทางข้อมูลสินค้าเข้า Shop

**เป้าหมาย:** แปลงข้อมูลดิบจาก Bigsaler → ข้อมูลพร้อมขึ้นหน้า Shop บน Supabase  
**ไฟล์ต้นทาง:** xlsx export จาก Bigsaler (Shopee format)  
**ปลายทาง:** ตาราง `affiliate_products` ใน Supabase

---

## 📥 ข้อมูลต้นทาง (Bigsaler xlsx)

โครงสร้างไฟล์ที่ได้จาก Bigsaler:

| คอลัมน์ | ข้อมูล | หมายเหตุ |
|---------|--------|---------|
| ชื่อสินค้า | ชื่อยาว มีคีย์เวิร์ด SEO ปน | ต้องย่อ/ทำความสะอาด |
| รายละเอียดสินค้าแบบเต็ม | HTML เต็มๆ | ต้องแกะ tag ออก |
| รายละเอียดสินค้าแบบย่อ | Text ธรรมดา | เอาไปใช้ได้เลย |
| ลิงก์แหล่งสินค้า | Shopee URL | เก็บเป็น original_link |
| ชื่อตัวเลือก 1-3 | size / color / etc. | — |
| การเลือกของตัวเลือก 1-3 | 40L สีดำ / 66L สีเหลือง | — |
| ราคา | ราคาต่อ variant | ต้อง merge หาราคาต่ำสุด |
| ส่วนลด | ราคาลด | — |
| สกุลเงิน | THB | — |
| รูปภาพสินค้า 1-9 | URL รูปจาก Shopee CDN | เลือกรูปหลัก 1 รูป |
| รูปภาพตัวเลือก 1-9 | URL รูป variant | — |

> ⚠️ **1 สินค้า = หลายแถว** — แต่ละแถวคือ 1 variant (size/สี)  
> ตัวอย่าง: กระเป๋า 40L/66L มี 4+ แถว (2 ขนาด × 2 สี)

---

## 📤 ข้อมูลปลายทาง (Supabase: affiliate_products)

| Field | ที่มา | หมายเหตุ |
|-------|-------|---------|
| `name` | ชื่อสินค้า (cleaned) | ย่อให้กระชับ |
| `brand` | ดึงจากชื่อหรือใส่มือ | |
| `price` | ราคาต่ำสุดของ variants | |
| `image_url` | รูปหลัก → upload R2 → URL ใหม่ | |
| `category` | AI วิเคราะห์จากชื่อ | ดูรายการด้านล่าง |
| `is_universal` | AI ตัดสิน | true = ใส่ได้ทุกรุ่น |
| `model_slugs` | ใส่รุ่นรถที่ใส่ได้ | ว่างถ้า is_universal = true |
| `shopee_link` | deeplink จาก Involve Asia | |
| `lazada_link` | deeplink จาก Involve Asia | ถ้ามี |
| `tiktok_link` | deeplink จาก Involve Asia | ถ้ามี |
| `original_link` | Shopee URL เดิม | เก็บไว้เป็นหลักฐาน |
| `deeplink_status` | สถานะการสร้าง deeplink | `pending` / `done` / `failed` |
| `is_published` | เปิด/ปิดโชว์บนหน้า Shop | default: false |
| `metadata.spec` | รายละเอียดเพิ่มเติม | จาก description ย่อ |

---

## 🔄 ขั้นตอน Pipeline

```
[INPUT] Bigsaler xlsx
    ↓
STEP 1 — MERGE VARIANTS
    รวมหลายแถว (variants) ให้เหลือ 1 แถวต่อสินค้า
    - ราคา: เก็บต่ำสุด
    - รูป: เก็บรูปแรก (รูปภาพสินค้า 1)
    - ลิงก์: เก็บ 1 URL (original_link)

    ↓
STEP 2 — CLEAN
    - ตัด HTML tag ออกจาก description
    - ย่อชื่อสินค้าให้กระชับ (AI)
    - เลือกรูปหลัก 1 รูป

    ↓
STEP 3 — ENRICH (AI)
    - category    → AI วิเคราะห์จากชื่อสินค้า
    - is_universal → AI ตัดสิน (ใส่ได้ทุกรุ่นไหม?)
    - model_slugs → AI ระบุรุ่นรถ (ถ้า is_universal=false)

    ↓
STEP 4 — DEEPLINK
    - ส่ง original_link → Involve Asia API
    - รับ deeplink กลับมา
    - บันทึก deeplink_status = "done"

    ↓
STEP 5 — IMAGE UPLOAD
    - ดาวน์โหลดรูปจาก Shopee CDN URL
    - upload → Cloudflare R2
    - อัพเดต image_url เป็น R2 URL ใหม่

    ↓
[OUTPUT] INSERT → Supabase affiliate_products
    is_published = false (รอ review ก่อน publish)
```

---

## 🏷️ Category List

| slug | ชื่อไทย | ตัวอย่างสินค้า |
|------|---------|--------------|
| `crashbar` | แคชบาร์ | กันล้ม, crashbar |
| `exhaust` | ท่อไอเสีย | ท่อ, exhaust, slip-on |
| `light` | ไฟ LED | ไฟหน้า, ไฟท้าย, DRL |
| `handle` | แฮนด์ | แฮนด์บาร์, กริ๊ป |
| `bag` | กระเป๋า | กระเป๋าท้าย, tail bag |
| `screen` | วินด์สกรีน | windscreen, บังลม |
| `rear_rack` | แร็คท้าย | แร็คท้าย, rear rack |
| `side_rack` | แร็คข้าง | แร็คข้าง, pannier |
| `sticker` | สติ๊กเกอร์ | สติ๊กเกอร์, decal |
| `top_box` | กล่องท้าย | top box, กล่องหลัง |
| `tire` | ยาง | ยาง, tire, tyre |
| `accessory` | อุปกรณ์เสริม | อื่นๆ ที่ไม่เข้าหมวดข้างบน |
| `other` | อื่นๆ | — |

---

## 🚦 สถานะ deeplink_status

| ค่า | ความหมาย |
|-----|---------|
| `pending` | ยังไม่ได้สร้าง deeplink |
| `done` | สร้าง deeplink เรียบร้อย |
| `failed` | สร้างไม่ได้ (ลิงก์หมดอายุ / สินค้าไม่อยู่ใน Involve Asia) |
| `manual` | ใส่ลิงก์มือ (ไม่ผ่าน API) |

---

## 🔴 Blockers ปัจจุบัน

| จุดติด | รายละเอียด |
|--------|-----------|
| STEP 3 (AI Enrich) | AI ใน n8n ไม่เสถียร — บื้อบ้าง ผิดบ้าง ทำให้ flow พัง |
| STEP 4 (Deeplink) | ยังไม่ได้ทดสอบ Involve Asia API จริง |
| STEP 5 (Image Upload) | Cloudflare R2 ยังไม่เคยทำเลย |

---

## 📎 ไฟล์ที่เกี่ยวข้อง

| ไฟล์ | หน้าที่ |
|------|---------|
| `C:\Users\Win10\Downloads\เอกสาร\test.xlsx` | ตัวอย่างไฟล์ Bigsaler |
| `engine/schema.sql` | DB schema ของ Supabase |
| `engine/data/4. ดีไซน์หลัก/Craftbikelab-Admin.html` | Admin panel สำหรับ review / publish สินค้า |

---

*อัพเดทล่าสุด: 29 เมษายน 2026*
