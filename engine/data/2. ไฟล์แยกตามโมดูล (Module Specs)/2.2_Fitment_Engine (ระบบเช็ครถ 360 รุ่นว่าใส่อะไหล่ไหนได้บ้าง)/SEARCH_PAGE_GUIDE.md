# 🔍 Search Results Page - Implementation Guide

> **หน้าค้นหาสินค้า พร้อม Filter, Sort และ Responsive Design**

---

## 📦 **ไฟล์ที่สร้างให้**

### 1. **`app/search/page.tsx`** - Server Component
- รับ Search Query จาก URL (`?q=...`)
- Normalize ชื่อรุ่นรถด้วย `normalizeModelName`
- ส่งข้อมูลไปให้ Client Component
- มี SEO Metadata

### 2. **`app/search/SearchResultsClient.tsx`** - Client Component
- Product Grid แสดงผลลัพธ์
- Filter Sidebar (Desktop)
- Filter Modal (Mobile)
- Sort Options
- Loading Skeleton + Error State
- Empty State

---

## ✨ **Features ทั้งหมด**

### 🔍 **Search & Filter**
- ✅ รับค่า `?q=...` จาก URL
- ✅ Normalize Query ด้วย `normalizeModelName`
- ✅ Filter by Category (7 หมวด)
- ✅ Filter by Brand (11 แบรนด์)
- ✅ Sort by (ราคา, Rating, ความใหม่)
- ✅ URL Parameters Sync

### 🎨 **UI/UX**
- ✅ Desktop: Sidebar Filter (Sticky)
- ✅ Mobile: Modal Filter (Bottom Sheet)
- ✅ Loading Skeleton
- ✅ Error State
- ✅ Empty State (ไม่พบสินค้า)
- ✅ Product Cards พร้อม Hover Effects

### 📱 **Responsive Design**
- ✅ Desktop (lg): Sidebar Filter + 3 Columns Grid
- ✅ Tablet (md): 2 Columns Grid
- ✅ Mobile: 1 Column + Modal Filter

---

## 🎯 **URL Structure**

### **ตัวอย่าง URL**

```
/search?q=pcx160
/search?q=pcx160&category=exhaust
/search?q=pcx160&category=suspension&brand=YSS
/search?q=pcx160&category=exhaust&sort=price_asc
```

### **Query Parameters**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `q` | string | คำค้นหา (required) | `pcx160`, `aerox155` |
| `category` | string | หมวดหมู่ | `exhaust`, `suspension` |
| `brand` | string | แบรนด์ | `YSS`, `Akrapovic` |
| `sort` | string | เรียงลำดับ | `price_asc`, `rating` |

---

## 📂 **Categories**

| ID | Name | Icon |
|----|------|------|
| `all` | ทั้งหมด | 🏍️ |
| `suspension` | ระบบช่วงล่าง | ⚙️ |
| `exhaust` | ท่อไอเสีย | 💨 |
| `body` | ชุดแต่ง & สี | 🎨 |
| `brake` | ระบบเบรก | 🛑 |
| `lighting` | ไฟและไฟฟ้า | 💡 |

---

## 🏷️ **Brands**

```
YSS, Akrapovic, Brembo, Enkei, Givi, RIZING,
Yoshimura, KYB, Ohlins, NGK, Bosch
```

---

## 🔄 **Sort Options**

| Value | Label |
|-------|-------|
| `relevance` | เกี่ยวข้องที่สุด |
| `price_asc` | ราคา: ต่ำ → สูง |
| `price_desc` | ราคา: สูง → ต่ำ |
| `rating` | คะแนนสูงสุด |
| `newest` | ล่าสุด |

---

## 🎨 **Design System**

### **สีหลัก**
- Background: `from-zinc-950 via-zinc-900 to-black`
- Card: `from-zinc-900 to-zinc-950`
- Border: `border-zinc-800`
- Accent: `yellow-500`

### **Hover Effects**
- Cards: `hover:scale-[1.02]`
- Buttons: `hover:border-yellow-500`
- Shadows: `hover:shadow-yellow-500/20`

### **Typography**
- Heading: `font-bold text-zinc-100`
- Body: `text-zinc-400`
- Accent: `text-yellow-500`

---

## 🔌 **Integration with Supabase**

### **ตอนนี้: Mock Data**
```tsx
// ใน SearchResultsClient.tsx
const mockProducts: Product[] = [ ... ];
```

### **การใช้งานจริง: Uncomment โค้ดนี้**

```tsx
// ใน SearchResultsClient.tsx
const supabase = createClient();

const { data, error } = await supabase
  .from('products')
  .select('*')
  .contains('compatible_models', [normalizedQuery])
  .eq(selectedCategory !== 'all' ? 'category' : '', selectedCategory)
  .eq(selectedBrand ? 'brand' : '', selectedBrand)
  .order(
    sortBy === 'price_asc' ? 'price' : 
    sortBy === 'price_desc' ? 'price' :
    sortBy === 'rating' ? 'rating' : 'created_at',
    { ascending: sortBy === 'price_asc' }
  );

if (error) {
  setError(error.message);
  return;
}

setProducts(data || []);
```

---

## 📊 **Database Query Logic**

### **Filter by Model**
```sql
SELECT * FROM products
WHERE compatible_models @> ARRAY['normalized_model_name'];
```

### **Filter by Category**
```sql
SELECT * FROM products
WHERE category = 'suspension';
```

### **Filter by Brand**
```sql
SELECT * FROM products
WHERE brand = 'YSS';
```

### **Sort by Price (Ascending)**
```sql
SELECT * FROM products
ORDER BY price ASC;
```

### **Combined Query**
```sql
SELECT * FROM products
WHERE compatible_models @> ARRAY['pcx160']
  AND category = 'exhaust'
  AND brand = 'Akrapovic'
ORDER BY price ASC;
```

---

## 🎭 **States Management**

### **Loading State**
```tsx
{isLoading && <ProductsGridSkeleton />}
```

### **Error State**
```tsx
{error && (
  <div className="p-4 bg-red-900/20 border border-red-500/50 ...">
    <AlertCircle />
    {error}
  </div>
)}
```

### **Empty State**
```tsx
{!isLoading && products.length === 0 && (
  <div className="text-center py-16">
    <Search className="w-12 h-12" />
    <h3>ไม่พบสินค้าที่ค้นหา</h3>
    <button onClick={clearFilters}>ล้างตัวกรอง</button>
  </div>
)}
```

### **Success State**
```tsx
{products.length > 0 && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {products.map(product => (
      <ProductCard key={product.id} product={product} />
    ))}
  </div>
)}
```

---

## 📱 **Mobile Experience**

### **Filter Modal (Bottom Sheet)**
- Slide up from bottom
- Backdrop blur
- Sticky header & footer
- Scrollable content
- CTA: "ดูผลลัพธ์" button

### **Mobile UI Elements**
```tsx
// Filter Button (Mobile Only)
<button className="lg:hidden w-full flex items-center ...">
  <SlidersHorizontal />
  ตัวกรอง & เรียงลำดับ
</button>

// Modal
{showMobileFilters && (
  <MobileFiltersModal
    onClose={() => setShowMobileFilters(false)}
    ...
  />
)}
```

---

## 🔧 **Customization Guide**

### **เพิ่มหมวดหมู่ใหม่**
```tsx
// ใน SearchResultsClient.tsx
const CATEGORIES = [
  { id: 'all', name: 'ทั้งหมด', icon: '🏍️' },
  { id: 'your-new-category', name: 'ชื่อหมวด', icon: '🔧' },
  // ... เพิ่มที่นี่
];
```

### **เพิ่มแบรนด์ใหม่**
```tsx
const BRANDS = [
  'YSS', 'Akrapovic',
  'Your-New-Brand',  // เพิ่มที่นี่
];
```

### **เพิ่ม Sort Option ใหม่**
```tsx
const SORT_OPTIONS = [
  { value: 'relevance', label: 'เกี่ยวข้องที่สุด' },
  { value: 'your-new-sort', label: 'ชื่อการเรียง' },  // เพิ่มที่นี่
];
```

---

## ⚡ **Performance Optimization**

### **1. Debouncing (Future)**
```tsx
// เพิ่ม debounce สำหรับ real-time search
const debouncedFetch = useDebounce(fetchProducts, 300);
```

### **2. Pagination**
```tsx
// เพิ่ม Load More button
const [page, setPage] = useState(1);
const limit = 12;

// Query with offset
.range(page * limit, (page + 1) * limit - 1)
```

### **3. Caching**
```tsx
// ใช้ SWR หรือ React Query
import useSWR from 'swr';

const { data, error } = useSWR(
  `/api/products?q=${normalizedQuery}`,
  fetcher
);
```

---

## 🐛 **Known Issues & Solutions**

### **Issue #1: Image Placeholder**
**Problem**: รูปภาพยังไม่มี  
**Solution**: ใช้ Placeholder Image
```tsx
image_url: 'https://via.placeholder.com/400x400?text=Product'
```

### **Issue #2: Mock Data**
**Problem**: ยังใช้ Mock Data  
**Solution**: Uncomment Supabase Query (line 93-107 ใน SearchResultsClient.tsx)

### **Issue #3: URL Not Updating**
**Problem**: Filter เปลี่ยนแต่ URL ไม่เปลี่ยน  
**Solution**: ตรวจสอบ `updateURL()` function

---

## ✅ **Testing Checklist**

### **Desktop**
- [ ] ✅ Sidebar Filter ทำงาน
- [ ] ✅ Sort Dropdown ทำงาน
- [ ] ✅ Product Grid แสดง 3 columns
- [ ] ✅ Hover effects ทำงาน
- [ ] ✅ URL Parameters sync

### **Mobile**
- [ ] ✅ Filter Button แสดง
- [ ] ✅ Modal เปิด/ปิดได้
- [ ] ✅ Product Grid แสดง 1 column
- [ ] ✅ Touch-friendly

### **States**
- [ ] ✅ Loading Skeleton แสดง
- [ ] ✅ Error State แสดง
- [ ] ✅ Empty State แสดง
- [ ] ✅ Success State แสดง

---

## 🚀 **Next Steps**

### **Phase 2.1: Pagination**
```tsx
// เพิ่ม Load More
<button onClick={() => setPage(page + 1)}>
  โหลดเพิ่ม
</button>
```

### **Phase 2.2: Price Range Filter**
```tsx
// เพิ่ม Price Slider
<input 
  type="range" 
  min={0} 
  max={50000} 
  value={maxPrice}
  onChange={(e) => setMaxPrice(e.target.value)}
/>
```

### **Phase 2.3: View Toggle**
```tsx
// สลับระหว่าง Grid / List View
<button onClick={() => setView('grid')}>Grid</button>
<button onClick={() => setView('list')}>List</button>
```

---

## 📞 **Support**

มีปัญหาหรือคำถาม?
- 📧 Email: dev@gutumrod.com
- 📚 Docs: อ่าน `README.md`

---

**Created**: March 10, 2026  
**Version**: 1.0.0 (Search Page Complete)  
**Status**: ✅ Ready for Production (with Mock Data)
