import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import SearchResultsClient from './SearchResultsClient';
import { normalizeModelName } from '@/lib/utils/normalizer';

// Types
interface SearchPageProps {
  searchParams: {
    q?: string;
    category?: string;
    brand?: string;
    sort?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  
  // ถ้าไม่มี query ให้ redirect ไปหน้าแรก
  if (!query) {
    notFound();
  }

  // Normalize search query
  const normalizedQuery = normalizeModelName(query);

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black">
      {/* Header Section */}
      <section className="border-b border-zinc-800 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-2">
              ผลการค้นหา: <span className="text-yellow-500">{query}</span>
            </h1>
            <p className="text-zinc-400">
              ค้นหาของแต่งที่ตรงรุ่น 100% สำหรับรถคุณ
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <Suspense fallback={<SearchResultsSkeleton />}>
        <SearchResultsClient 
          query={query}
          normalizedQuery={normalizedQuery}
          initialCategory={searchParams.category}
          initialBrand={searchParams.brand}
          initialSort={searchParams.sort}
        />
      </Suspense>
    </main>
  );
}

// Loading Skeleton
function SearchResultsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-8">
          {/* Sidebar Skeleton */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
              <div className="h-6 bg-zinc-800 rounded w-32 mb-6 animate-pulse" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="mb-4">
                  <div className="h-4 bg-zinc-800 rounded w-full animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Products Grid Skeleton */}
          <div className="flex-1">
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
          </div>
        </div>
      </div>
    </div>
  );
}

// Metadata for SEO
export async function generateMetadata({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  return {
    title: `ค้นหา: ${query} | กูทำรถ - แพลตฟอร์มรวมของแต่งมอเตอร์ไซค์`,
    description: `ค้นหาของแต่งสำหรับ ${query} ตรวจสอบความเข้ากันได้โดย AI 13 แผนก ตรงรุ่น 100%`,
  };
}
