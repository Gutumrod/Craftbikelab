import { redirect } from 'next/navigation';
import SearchResultsClient from './SearchResultsClient';
import { normalizeModelNameWithDB } from '@/lib/utils/normalizer';

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

  const normalizedQuery = await normalizeModelNameWithDB(q);

  return (
    <main className="min-h-screen bg-black">
      <SearchResultsClient
        query={q}
        normalizedQuery={normalizedQuery}
        initialCategory={searchParams.category || 'all'}
        initialBrand={searchParams.brand}
        initialSort={searchParams.sort || 'relevance'}
      />
    </main>
  );
}
