'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Filter, 
  X, 
  ChevronDown, 
  Star, 
  ShoppingCart, 
  TrendingUp,
  SlidersHorizontal,
  AlertCircle,
  Search
} from 'lucide-react';

// Types
interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  original_price?: number;
  image_url: string;
  rating: number;
  reviews_count: number;
  compatible_models: string[];
  is_verified: boolean;
}

interface SearchResultsClientProps {
  query: string;
  normalizedQuery: string;
  initialCategory?: string;
  initialBrand?: string;
  initialSort?: string;
}

// Categories
const CATEGORIES = [
  { id: 'all', name: 'ทั้งหมด', icon: '🏍️' },
  { id: 'suspension', name: 'ระบบช่วงล่าง', icon: '⚙️' },
  { id: 'exhaust', name: 'ท่อไอเสีย', icon: '💨' },
  { id: 'body', name: 'ชุดแต่ง & สี', icon: '🎨' },
  { id: 'brake', name: 'ระบบเบรก', icon: '🛑' },
  { id: 'lighting', name: 'ไฟและไฟฟ้า', icon: '💡' },
];

// Brands
const BRANDS = [
  'YSS', 'Akrapovic', 'Brembo', 'Enkei', 'Givi', 'RIZING',
  'Yoshimura', 'KYB', 'Ohlins', 'NGK', 'Bosch'
];

// Sort Options
const SORT_OPTIONS = [
  { value: 'relevance', label: 'เกี่ยวข้องที่สุด' },
  { value: 'price_asc', label: 'ราคา: ต่ำ → สูง' },
  { value: 'price_desc', label: 'ราคา: สูง → ต่ำ' },
  { value: 'rating', label: 'คะแนนสูงสุด' },
  { value: 'newest', label: 'ล่าสุด' },
];

export default function SearchResultsClient({
  query,
  normalizedQuery,
  initialCategory = 'all',
  initialBrand,
  initialSort = 'relevance'
}: SearchResultsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Filters State
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(initialBrand || null);
  const [sortBy, setSortBy] = useState(initialSort);

  // Fetch Products
  useEffect(() => {
    fetchProducts();
  }, [normalizedQuery, selectedCategory, selectedBrand, sortBy]);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // จริงๆ จะเป็นการ Query จาก Supabase
      // const supabase = createClient();
      // const { data, error } = await supabase
      //   .from('products')
      //   .select('*')
      //   .contains('compatible_models', [normalizedQuery])
      //   .eq(selectedCategory !== 'all' ? 'category' : '', selectedCategory)
      //   .order(sortBy === 'price_asc' ? 'price' : sortBy, { ascending: sortBy === 'price_asc' });

      // Mock Data สำหรับตอนนี้
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay

      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'โช๊คหลัง YSS สำหรับ Honda PCX 160',
          brand: 'YSS',
          category: 'ระบบช่วงล่าง',
          price: 3990,
          original_price: 4990,
          image_url: '/images/products/yss-shock-pcx.jpg',
          rating: 4.8,
          reviews_count: 156,
          compatible_models: ['Honda PCX 160', 'Honda PCX 150'],
          is_verified: true,
        },
        {
          id: '2',
          name: 'ท่อ Akrapovic Slip-On PCX 160',
          brand: 'Akrapovic',
          category: 'ท่อไอเสีย',
          price: 12900,
          original_price: 14900,
          image_url: '/images/products/akrapovic-pcx.jpg',
          rating: 4.9,
          reviews_count: 89,
          compatible_models: ['Honda PCX 160'],
          is_verified: true,
        },
        {
          id: '3',
          name: 'ล้อแม็ก Enkei Racing ขอบ 14 นิ้ว',
          brand: 'Enkei',
          category: 'ระบบช่วงล่าง',
          price: 22900,
          image_url: '/images/products/enkei-pcx.jpg',
          rating: 5.0,
          reviews_count: 42,
          compatible_models: ['Honda PCX 160', 'Honda PCX 150'],
          is_verified: true,
        },
        {
          id: '4',
          name: 'ชุดแต่งบอดี้ Full Set PCX 160',
          brand: 'Givi',
          category: 'ชุดแต่ง & สี',
          price: 8900,
          original_price: 10900,
          image_url: '/images/products/givi-pcx-bodykit.jpg',
          rating: 4.6,
          reviews_count: 124,
          compatible_models: ['Honda PCX 160'],
          is_verified: true,
        },
        {
          id: '5',
          name: 'ดิสเบรกหน้า Brembo 260mm',
          brand: 'Brembo',
          category: 'ระบบเบรก',
          price: 5900,
          image_url: '/images/products/brembo-pcx.jpg',
          rating: 4.7,
          reviews_count: 203,
          compatible_models: ['Honda PCX 160', 'Honda PCX 150'],
          is_verified: true,
        },
        {
          id: '6',
          name: 'ไฟหน้า LED Projector PCX 160',
          brand: 'RIZING',
          category: 'ไฟและไฟฟ้า',
          price: 4500,
          original_price: 5900,
          image_url: '/images/products/rizing-led-pcx.jpg',
          rating: 4.5,
          reviews_count: 78,
          compatible_models: ['Honda PCX 160'],
          is_verified: true,
        },
      ];

      // Apply Filters
      let filtered = mockProducts;

      if (selectedCategory !== 'all') {
        filtered = filtered.filter(p => p.category === selectedCategory);
      }

      if (selectedBrand) {
        filtered = filtered.filter(p => p.brand === selectedBrand);
      }

      // Apply Sort
      if (sortBy === 'price_asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price_desc') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
      }

      setProducts(filtered);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('เกิดข้อผิดพลาดในการค้นหาสินค้า กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  // Update URL when filters change
  const updateURL = (newCategory?: string, newBrand?: string | null, newSort?: string) => {
    const params = new URLSearchParams();
    params.set('q', query);
    
    if (newCategory && newCategory !== 'all') {
      params.set('category', newCategory);
    }
    
    if (newBrand) {
      params.set('brand', newBrand);
    }
    
    if (newSort && newSort !== 'relevance') {
      params.set('sort', newSort);
    }
    
    router.push(`/search?${params.toString()}`);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    updateURL(category, selectedBrand, sortBy);
  };

  const handleBrandChange = (brand: string | null) => {
    setSelectedBrand(brand);
    updateURL(selectedCategory, brand, sortBy);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    updateURL(selectedCategory, selectedBrand, sort);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand(null);
    setSortBy('relevance');
    router.push(`/search?q=${query}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar
              categories={CATEGORIES}
              brands={BRANDS}
              selectedCategory={selectedCategory}
              selectedBrand={selectedBrand}
              onCategoryChange={handleCategoryChange}
              onBrandChange={handleBrandChange}
              onClearFilters={clearFilters}
            />
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 hover:border-yellow-500 transition-all"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>ตัวกรอง & เรียงลำดับ</span>
              </button>
            </div>

            {/* Sort & Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-zinc-400">
                {isLoading ? (
                  <span className="animate-pulse">กำลังค้นหา...</span>
                ) : (
                  <>พบ <span className="text-yellow-500 font-semibold">{products.length}</span> รายการ</>
                )}
              </p>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none focus:border-yellow-500 transition-all cursor-pointer appearance-none pr-10"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && <ProductsGridSkeleton />}

            {/* Empty State */}
            {!isLoading && !error && products.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-zinc-900 rounded-full flex items-center justify-center">
                  <Search className="w-12 h-12 text-zinc-700" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-100 mb-2">
                  ไม่พบสินค้าที่ค้นหา
                </h3>
                <p className="text-zinc-400 mb-6">
                  ลองค้นหาด้วยคำอื่น หรือลองเปลี่ยนตัวกรอง
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-yellow-500/10 border border-yellow-500/50 rounded-lg text-yellow-500 hover:bg-yellow-500/20 transition-all"
                >
                  ล้างตัวกรองทั้งหมด
                </button>
              </div>
            )}

            {/* Products Grid */}
            {!isLoading && !error && products.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <MobileFiltersModal
          categories={CATEGORIES}
          brands={BRANDS}
          selectedCategory={selectedCategory}
          selectedBrand={selectedBrand}
          sortBy={sortBy}
          onCategoryChange={handleCategoryChange}
          onBrandChange={handleBrandChange}
          onSortChange={handleSortChange}
          onClearFilters={clearFilters}
          onClose={() => setShowMobileFilters(false)}
        />
      )}
    </div>
  );
}

// Filter Sidebar Component
function FilterSidebar({
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  onCategoryChange,
  onBrandChange,
  onClearFilters
}: any) {
  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl border border-zinc-800 p-6 sticky top-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
          <Filter className="w-5 h-5 text-yellow-500" />
          ตัวกรอง
        </h3>
        <button
          onClick={onClearFilters}
          className="text-sm text-zinc-500 hover:text-yellow-500 transition-colors"
        >
          ล้างทั้งหมด
        </button>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          หมวดหมู่
        </h4>
        <div className="space-y-2">
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              <span className="text-sm">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          แบรนด์
        </h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {brands.map((brand: string) => (
            <button
              key={brand}
              onClick={() => onBrandChange(selectedBrand === brand ? null : brand)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                selectedBrand === brand
                  ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Mobile Filters Modal Component
function MobileFiltersModal({
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  sortBy,
  onCategoryChange,
  onBrandChange,
  onSortChange,
  onClearFilters,
  onClose
}: any) {
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute bottom-0 left-0 right-0 bg-zinc-950 rounded-t-2xl border-t border-zinc-800 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-950 border-b border-zinc-800 p-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-100">ตัวกรอง & เรียงลำดับ</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-900 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Sort */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              เรียงลำดับ
            </h4>
            <div className="space-y-2">
              {SORT_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => onSortChange(option.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                    sortBy === option.value
                      ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50'
                      : 'text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              หมวดหมู่
            </h4>
            <div className="space-y-2">
              {categories.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50'
                      : 'text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-sm">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              แบรนด์
            </h4>
            <div className="space-y-2">
              {brands.map((brand: string) => (
                <button
                  key={brand}
                  onClick={() => onBrandChange(selectedBrand === brand ? null : brand)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                    selectedBrand === brand
                      ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50'
                      : 'text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-zinc-950 border-t border-zinc-800 p-4 flex gap-3">
          <button
            onClick={onClearFilters}
            className="flex-1 px-4 py-3 border-2 border-zinc-700 text-zinc-300 rounded-lg hover:border-yellow-500 hover:text-yellow-500 transition-all font-semibold"
          >
            ล้างทั้งหมด
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black rounded-lg hover:from-yellow-500 hover:to-yellow-400 transition-all font-bold"
          >
            ดูผลลัพธ์
          </button>
        </div>
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({ product }: { product: Product }) {
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;

  return (
    <Link
      href={`/product/${product.id}`}
      className="group relative bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden hover:border-yellow-500/50 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-yellow-500/20"
    >
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-red-600 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
          -{discountPercent}%
        </div>
      )}

      {/* Verified Badge */}
      {product.is_verified && (
        <div className="absolute top-4 left-4 z-10 bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/50 text-yellow-500 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          Verified
        </div>
      )}

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-zinc-800">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Product Info */}
      <div className="p-6">
        {/* Brand */}
        <div className="text-yellow-500 text-xs font-semibold uppercase tracking-wider mb-2">
          {product.brand}
        </div>

        {/* Product Name */}
        <h3 className="text-zinc-100 font-bold text-lg mb-2 line-clamp-2 group-hover:text-yellow-500 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating)
                    ? 'fill-yellow-500 text-yellow-500'
                    : 'text-zinc-700'
                }`}
              />
            ))}
          </div>
          <span className="text-zinc-400 text-sm">
            {product.rating.toFixed(1)} ({product.reviews_count})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          <div>
            {hasDiscount && (
              <div className="text-zinc-500 text-sm line-through">
                ฿{product.original_price?.toLocaleString()}
              </div>
            )}
            <div className="text-yellow-500 text-2xl font-bold">
              ฿{product.price.toLocaleString()}
            </div>
          </div>

          <button 
            className="p-3 bg-yellow-500/10 rounded-lg hover:bg-yellow-500/20 transition-all hover:scale-110"
            aria-label="เพิ่มลงตะกร้า"
          >
            <ShoppingCart className="w-5 h-5 text-yellow-500" />
          </button>
        </div>
      </div>
    </Link>
  );
}

// Products Grid Skeleton
function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden animate-pulse">
          <div className="w-full h-64 bg-zinc-800" />
          <div className="p-6 space-y-3">
            <div className="h-4 bg-zinc-800 rounded w-3/4" />
            <div className="h-6 bg-zinc-800 rounded w-full" />
            <div className="h-4 bg-zinc-800 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
