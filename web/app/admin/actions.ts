'use server';

import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import type { ProductStatus } from '@/lib/shop-products';

export type ActionResult = { ok: true } | { ok: false; error: string };

const PRODUCT_STATUSES = ['pending', 'active', 'archived'] as const;
const SERVICE_ROLE_ERROR = 'ระบบยังไม่ได้ตั้งค่า service-role key';
const GENERIC_ERROR = 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง';

type ProductPatch = {
  name?: string;
  brand?: string;
  category?: string;
  price?: number | null;
};

type ModelSearchResult = {
  slug: string;
  brand: string;
  model: string;
};

type ModelRow = {
  Brand: string | null;
  Model: string | null;
  slug: string | null;
};

type AliasRow = {
  model_slug: string | null;
};

function validateProductId(productId: number): ActionResult | null {
  if (
    typeof productId !== 'number' ||
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    return { ok: false, error: 'รหัสสินค้าไม่ถูกต้อง' };
  }

  return null;
}

function isProductStatus(value: string): value is ProductStatus {
  return PRODUCT_STATUSES.includes(value as ProductStatus);
}

function normalizeOptionalText(
  value: unknown,
  maxLength: number,
  fieldLabel: string,
  allowEmpty = true,
): { value: string | null; error: string | null } {
  if (typeof value !== 'string') {
    return { value: null, error: `${fieldLabel}ไม่ถูกต้อง` };
  }

  const trimmed = value.trim();

  if (!allowEmpty && !trimmed) {
    return { value: null, error: `กรุณากรอก${fieldLabel}` };
  }

  if (trimmed.length > maxLength) {
    return { value: null, error: `${fieldLabel}ต้องไม่เกิน ${maxLength} ตัวอักษร` };
  }

  return { value: trimmed || null, error: null };
}

function normalizeModelSlug(modelSlug: unknown): string | null {
  if (typeof modelSlug !== 'string') return null;

  const trimmed = modelSlug.trim();
  if (!trimmed || trimmed.length > 160) return null;

  return trimmed;
}

function getAdminClientOrError() {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return { supabase: null, result: { ok: false, error: SERVICE_ROLE_ERROR } as ActionResult };
  }

  return { supabase, result: null };
}

export async function updateProduct(
  productId: number,
  patch: ProductPatch,
): Promise<ActionResult> {
  const productIdError = validateProductId(productId);
  if (productIdError) return productIdError;

  if (!patch || typeof patch !== 'object') {
    return { ok: false, error: 'ข้อมูลสินค้าไม่ถูกต้อง' };
  }

  const update: Record<string, string | number | null> = {};

  if ('name' in patch) {
    const { value, error } = normalizeOptionalText(patch.name, 300, 'ชื่อสินค้า', false);
    if (error) return { ok: false, error };
    update.name = value;
  }

  if ('brand' in patch) {
    const { value, error } = normalizeOptionalText(patch.brand, 120, 'แบรนด์');
    if (error) return { ok: false, error };
    update.brand = value;
  }

  if ('category' in patch) {
    const { value, error } = normalizeOptionalText(
      patch.category,
      80,
      'หมวดหมู่',
      false,
    );
    if (error) return { ok: false, error };
    update.category = value;
  }

  if ('price' in patch) {
    if (patch.price !== null) {
      if (
        typeof patch.price !== 'number' ||
        !Number.isFinite(patch.price) ||
        patch.price < 0
      ) {
        return { ok: false, error: 'ราคาต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป' };
      }
    }

    update.price = patch.price;
  }

  if (Object.keys(update).length === 0) {
    return { ok: false, error: 'ไม่มีข้อมูลที่ต้องแก้ไข' };
  }

  update.updated_at = new Date().toISOString();

  const { supabase, result } = getAdminClientOrError();
  if (!supabase) return result;

  const { error } = await supabase
    .from('affiliate_products')
    .update(update)
    .eq('id', productId);

  if (error) {
    console.error('[AdminProducts] Failed to update affiliate_product', {
      productId,
      fields: Object.keys(update),
      message: error.message,
      code: error.code,
    });
    return { ok: false, error: GENERIC_ERROR };
  }

  return { ok: true };
}

export async function setProductStatus(
  productId: number,
  status: ProductStatus,
): Promise<ActionResult> {
  const productIdError = validateProductId(productId);
  if (productIdError) return productIdError;

  if (typeof status !== 'string' || !isProductStatus(status)) {
    return { ok: false, error: 'สถานะสินค้าไม่ถูกต้อง' };
  }

  const { supabase, result } = getAdminClientOrError();
  if (!supabase) return result;

  const { error } = await supabase
    .from('affiliate_products')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId);

  if (error) {
    console.error('[AdminProducts] Failed to update affiliate_product status', {
      productId,
      status,
      message: error.message,
      code: error.code,
    });
    return { ok: false, error: GENERIC_ERROR };
  }

  return { ok: true };
}

export async function setProductUniversal(
  productId: number,
  isUniversal: boolean,
): Promise<ActionResult> {
  const productIdError = validateProductId(productId);
  if (productIdError) return productIdError;

  if (typeof isUniversal !== 'boolean') {
    return { ok: false, error: 'ค่า universal ไม่ถูกต้อง' };
  }

  const { supabase, result } = getAdminClientOrError();
  if (!supabase) return result;

  const { error: updateError } = await supabase
    .from('affiliate_products')
    .update({
      is_universal: isUniversal,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId);

  if (updateError) {
    console.error('[AdminProducts] Failed to update affiliate_product universal flag', {
      productId,
      isUniversal,
      message: updateError.message,
      code: updateError.code,
    });
    return { ok: false, error: GENERIC_ERROR };
  }

  if (!isUniversal) {
    return { ok: true };
  }

  const { error: deleteError } = await supabase
    .from('product_model_mapping')
    .delete()
    .eq('product_id', productId);

  if (deleteError) {
    console.error('[AdminProducts] Failed to delete mappings for universal product', {
      productId,
      message: deleteError.message,
      code: deleteError.code,
    });

    const { error: rollbackError } = await supabase
      .from('affiliate_products')
      .update({
        is_universal: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);

    if (rollbackError) {
      console.error('[AdminProducts] Failed to roll back universal flag after mapping delete error', {
        productId,
        message: rollbackError.message,
        code: rollbackError.code,
      });
    }

    return { ok: false, error: GENERIC_ERROR };
  }

  return { ok: true };
}

export async function addProductFitment(
  productId: number,
  modelSlug: string,
): Promise<ActionResult> {
  const productIdError = validateProductId(productId);
  if (productIdError) return productIdError;

  const slug = normalizeModelSlug(modelSlug);
  if (!slug) {
    return { ok: false, error: 'รุ่นรถไม่ถูกต้อง' };
  }

  const { supabase, result } = getAdminClientOrError();
  if (!supabase) return result;

  const { data: model, error: modelError } = await supabase
    .from('models')
    .select('slug')
    .eq('slug', slug)
    .maybeSingle();

  if (modelError) {
    console.error('[AdminProducts] Failed to validate model slug before fitment insert', {
      productId,
      modelSlug: slug,
      message: modelError.message,
      code: modelError.code,
    });
    return { ok: false, error: GENERIC_ERROR };
  }

  if (!model) {
    return { ok: false, error: 'ไม่พบรุ่นรถนี้ในระบบ' };
  }

  const { data: existing, error: existingError } = await supabase
    .from('product_model_mapping')
    .select('id')
    .eq('product_id', productId)
    .eq('model_slug', slug)
    .maybeSingle();

  if (existingError) {
    console.error('[AdminProducts] Failed to check duplicate product fitment', {
      productId,
      modelSlug: slug,
      message: existingError.message,
      code: existingError.code,
    });
    return { ok: false, error: GENERIC_ERROR };
  }

  if (existing) {
    return { ok: true };
  }

  const { error: insertError } = await supabase
    .from('product_model_mapping')
    .insert({
      product_id: productId,
      model_slug: slug,
    });

  if (insertError) {
    console.error('[AdminProducts] Failed to insert product fitment', {
      productId,
      modelSlug: slug,
      message: insertError.message,
      code: insertError.code,
    });
    return { ok: false, error: GENERIC_ERROR };
  }

  const { error: updateError } = await supabase
    .from('affiliate_products')
    .update({
      is_universal: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId);

  if (updateError) {
    console.error('[AdminProducts] Failed to clear universal flag after fitment insert', {
      productId,
      modelSlug: slug,
      message: updateError.message,
      code: updateError.code,
    });
    return { ok: false, error: GENERIC_ERROR };
  }

  return { ok: true };
}

export async function removeProductFitment(
  productId: number,
  modelSlug: string,
): Promise<ActionResult> {
  const productIdError = validateProductId(productId);
  if (productIdError) return productIdError;

  const slug = normalizeModelSlug(modelSlug);
  if (!slug) {
    return { ok: false, error: 'รุ่นรถไม่ถูกต้อง' };
  }

  const { supabase, result } = getAdminClientOrError();
  if (!supabase) return result;

  const { error } = await supabase
    .from('product_model_mapping')
    .delete()
    .eq('product_id', productId)
    .eq('model_slug', slug);

  if (error) {
    console.error('[AdminProducts] Failed to remove product fitment', {
      productId,
      modelSlug: slug,
      message: error.message,
      code: error.code,
    });
    return { ok: false, error: GENERIC_ERROR };
  }

  const { error: updateError } = await supabase
    .from('affiliate_products')
    .update({
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId);

  if (updateError) {
    console.error('[AdminProducts] Failed to touch product after fitment delete', {
      productId,
      modelSlug: slug,
      message: updateError.message,
      code: updateError.code,
    });
    return { ok: false, error: GENERIC_ERROR };
  }

  return { ok: true };
}

export async function searchModels(query: string): Promise<ModelSearchResult[]> {
  const searchTerm = typeof query === 'string' ? query.trim() : '';

  if (searchTerm.length < 2 || searchTerm.length > 80) {
    return [];
  }

  const { supabase } = getAdminClientOrError();
  if (!supabase) {
    console.error('[AdminProducts] Missing Supabase service-role env for model search');
    return [];
  }

  const escaped = searchTerm.replace(/[%_]/g, (match) => `\\${match}`);
  const pattern = `%${escaped}%`;
  const modelMap = new Map<string, ModelSearchResult>();

  const { data: modelRows, error: modelError } = await supabase
    .from('models')
    .select('"Brand", "Model", slug')
    .or(`slug.ilike.${pattern},"Brand".ilike.${pattern},"Model".ilike.${pattern}`)
    .limit(20);

  if (modelError) {
    console.error('[AdminProducts] Failed to search models', {
      query: searchTerm,
      message: modelError.message,
      code: modelError.code,
    });
    return [];
  }

  for (const row of (modelRows ?? []) as ModelRow[]) {
    if (!row.slug) continue;

    modelMap.set(row.slug, {
      slug: row.slug,
      brand: row.Brand ?? '',
      model: row.Model ?? '',
    });
  }

  const { data: aliasRows, error: aliasError } = await supabase
    .from('model_aliases')
    .select('model_slug')
    .ilike('alias', pattern)
    .limit(20);

  if (aliasError) {
    console.error('[AdminProducts] Failed to search model_aliases', {
      query: searchTerm,
      message: aliasError.message,
      code: aliasError.code,
    });
    return Array.from(modelMap.values()).slice(0, 20);
  }

  const aliasSlugs = Array.from(
    new Set(
      ((aliasRows ?? []) as AliasRow[])
        .map((row) => row.model_slug)
        .filter((slug): slug is string => typeof slug === 'string' && slug.length > 0),
    ),
  ).filter((slug) => !modelMap.has(slug));

  if (aliasSlugs.length > 0) {
    const { data: aliasModelRows, error: aliasModelError } = await supabase
      .from('models')
      .select('"Brand", "Model", slug')
      .in('slug', aliasSlugs)
      .limit(20);

    if (aliasModelError) {
      console.error('[AdminProducts] Failed to load alias-matched models', {
        query: searchTerm,
        aliasSlugCount: aliasSlugs.length,
        message: aliasModelError.message,
        code: aliasModelError.code,
      });
    } else {
      for (const row of (aliasModelRows ?? []) as ModelRow[]) {
        if (!row.slug) continue;

        modelMap.set(row.slug, {
          slug: row.slug,
          brand: row.Brand ?? '',
          model: row.Model ?? '',
        });
      }
    }
  }

  return Array.from(modelMap.values()).slice(0, 20);
}
