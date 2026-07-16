import 'server-only';

import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export type ProductStatus = 'pending' | 'active' | 'archived';

export interface AffiliateProduct {
  id: number;
  name: string;
  brand: string | null;
  category: string;
  price: number | null;
  status: ProductStatus;
  shopee_link: string;
  lazada_link: string | null;
  tiktok_link: string | null;
  image_urls: string[];
  metadata: Record<string, unknown> | null;
  is_universal: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
  fitment: string[];
}

export interface AdminProductsResult {
  products: AffiliateProduct[];
  error: string | null;
}

type ProductMappingRow = {
  model_slug: string | null;
};

type AffiliateProductRow = Omit<AffiliateProduct, 'fitment' | 'image_urls'> & {
  image_urls: unknown;
  product_model_mapping?: ProductMappingRow[] | null;
};

const PRODUCT_STATUSES = ['pending', 'active', 'archived'] as const;

function isProductStatus(value: string): value is ProductStatus {
  return PRODUCT_STATUSES.includes(value as ProductStatus);
}

function normalizeImageUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is string => typeof item === 'string');
}

function normalizeProduct(row: AffiliateProductRow): AffiliateProduct {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    price: row.price,
    status: isProductStatus(row.status) ? row.status : 'pending',
    shopee_link: row.shopee_link,
    lazada_link: row.lazada_link,
    tiktok_link: row.tiktok_link,
    image_urls: normalizeImageUrls(row.image_urls),
    metadata: row.metadata,
    is_universal: row.is_universal,
    slug: row.slug,
    created_at: row.created_at,
    updated_at: row.updated_at,
    fitment: (row.product_model_mapping ?? [])
      .map((mapping) => mapping.model_slug)
      .filter((slug): slug is string => typeof slug === 'string' && slug.length > 0),
  };
}

export async function getProductsForAdmin(
  statusFilter?: ProductStatus,
): Promise<AdminProductsResult> {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    console.error('[ShopProducts] Missing Supabase service-role env for admin select');
    return {
      products: [],
      error: 'ระบบยังไม่ได้ตั้งค่า service-role key',
    };
  }

  let query = supabase
    .from('affiliate_products')
    .select(
      'id, name, brand, category, price, status, shopee_link, lazada_link, tiktok_link, image_urls, metadata, is_universal, slug, created_at, updated_at, product_model_mapping(model_slug)',
    )
    .order('created_at', { ascending: false });

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[ShopProducts] Failed to select affiliate_products for admin', {
      message: error.message,
      code: error.code,
    });

    return {
      products: [],
      error: 'ไม่สามารถโหลดรายการสินค้าได้ ลองใหม่อีกครั้ง',
    };
  }

  return {
    products: ((data ?? []) as AffiliateProductRow[]).map(normalizeProduct),
    error: null,
  };
}
