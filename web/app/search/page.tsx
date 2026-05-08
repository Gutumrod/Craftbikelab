import { redirect } from 'next/navigation';
import SearchResultsClient from './SearchResultsClient';

interface SearchPageProps {
  searchParams: Promise<{ 
    q?: string;
    category?: string;
    brand?: string;
    sort?: string;
  }>;
}

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || '';

  if (!q) {
    redirect('/');
  }

  // ส่ง Props ให้ครบตามที่ SearchResultsClient โค้ดเดิมต้องการ
  return (
    <main className="min-h-screen bg-black">
      <SearchResultsClient 
        query={q} 
        normalizedQuery={q.toLowerCase()} // ใส่เพิ่มเพื่อให้โค้ดเดิมทำงานได้
        initialCategory={searchParams.category || 'all'}
        initialBrand={searchParams.brand}
        initialSort={searchParams.sort || 'relevance'}
      />
    </main>
  );
}
