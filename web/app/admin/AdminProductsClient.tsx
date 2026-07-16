'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  Archive,
  Check,
  ExternalLink,
  Loader2,
  PackageCheck,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import type { AffiliateProduct, ProductStatus } from '@/lib/shop-products';
import {
  addProductFitment,
  removeProductFitment,
  searchModels,
  setProductStatus,
  setProductUniversal,
  updateProduct,
} from './actions';
import {
  approveTripRoute,
  rejectTripRoute,
  type PendingTripRoute,
} from './trip-actions';

type AdminTab = 'products' | 'trips';
type ProductFilter = 'all' | ProductStatus;

type ModelSearchResult = {
  slug: string;
  brand: string;
  model: string;
};

type ProductDraft = {
  name: string;
  brand: string;
  category: string;
  price: string;
};

type Props = {
  initialProducts: AffiliateProduct[];
  initialProductError: string | null;
  initialTrips: PendingTripRoute[];
  initialTripError: string | null;
};

const R2_PRODUCT_PREFIX = 'https://pub-5ea1d2d71b294d56bb3cea327491e41e.r2.dev/';

const FILTERS: Array<{ value: ProductFilter; label: string }> = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

const STATUS_LABELS: Record<ProductStatus, string> = {
  pending: 'รอตรวจ',
  active: 'เผยแพร่',
  archived: 'เก็บถาวร',
};

const STATUS_STYLES: Record<ProductStatus, string> = {
  pending: 'border-secondary/40 bg-secondary/10 text-secondary',
  active: 'border-primary/40 bg-primary/10 text-primary',
  archived: 'border-outline/60 bg-surface-container text-on-surface-variant',
};

function formatPrice(price: number | null): string {
  if (price == null) return '-';

  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function createDraft(product: AffiliateProduct): ProductDraft {
  return {
    name: product.name,
    brand: product.brand ?? '',
    category: product.category,
    price: product.price == null ? '' : String(product.price),
  };
}

function getProductWarnings(product: AffiliateProduct): string[] {
  const warnings: string[] = [];
  const firstImage = product.image_urls[0] ?? '';

  if (!firstImage.startsWith(R2_PRODUCT_PREFIX)) {
    warnings.push('รูปยังไม่ได้ย้ายเข้า R2');
  }

  if (product.fitment.length === 0 && !product.is_universal) {
    warnings.push('ยังไม่ได้กำหนดรุ่นรถที่ใส่ได้ ลูกค้าจะหาสินค้านี้ไม่เจอ');
  }

  return warnings;
}

export default function AdminProductsClient({
  initialProducts,
  initialProductError,
  initialTrips,
  initialTripError,
}: Props) {
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [products, setProducts] = useState(initialProducts);
  const [trips, setTrips] = useState(initialTrips);
  const [productError, setProductError] = useState(initialProductError);
  const [tripError, setTripError] = useState(initialTripError);
  const [filter, setFilter] = useState<ProductFilter>('all');
  const [selectedProduct, setSelectedProduct] = useState<AffiliateProduct | null>(null);
  const [draft, setDraft] = useState<ProductDraft | null>(null);
  const [modelQuery, setModelQuery] = useState('');
  const [modelResults, setModelResults] = useState<ModelSearchResult[]>([]);
  const [isSearching, startSearchTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();

  const productCounts = useMemo(() => {
    return products.reduce(
      (counts, product) => {
        counts.all += 1;
        counts[product.status] += 1;
        return counts;
      },
      { all: 0, pending: 0, active: 0, archived: 0 },
    );
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (filter === 'all') return products;

    return products.filter((product) => product.status === filter);
  }, [filter, products]);

  const selectedWarnings = selectedProduct ? getProductWarnings(selectedProduct) : [];

  useEffect(() => {
    let ignore = false;
    const query = modelQuery.trim();

    if (query.length < 2) {
      setModelResults([]);
      return;
    }

    const timer = window.setTimeout(() => {
      startSearchTransition(async () => {
        const results = await searchModels(query);
        if (!ignore) {
          setModelResults(results);
        }
      });
    }, 250);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [modelQuery]);

  function syncProduct(product: AffiliateProduct) {
    setProducts((current) =>
      current.map((item) => (item.id === product.id ? product : item)),
    );
    setSelectedProduct(product);
  }

  function openProduct(product: AffiliateProduct) {
    setSelectedProduct(product);
    setDraft(createDraft(product));
    setModelQuery('');
    setModelResults([]);
  }

  function closeProduct() {
    setSelectedProduct(null);
    setDraft(null);
    setModelQuery('');
    setModelResults([]);
  }

  function handleSaveProduct() {
    if (!selectedProduct || !draft) return;

    const parsedPrice = draft.price.trim() === '' ? null : Number(draft.price);
    if (parsedPrice !== null && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) {
      window.alert('ราคาต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป');
      return;
    }

    startSaveTransition(async () => {
      const result = await updateProduct(selectedProduct.id, {
        name: draft.name,
        brand: draft.brand,
        category: draft.category,
        price: parsedPrice,
      });

      if (!result.ok) {
        window.alert(result.error);
        return;
      }

      syncProduct({
        ...selectedProduct,
        name: draft.name.trim(),
        brand: draft.brand.trim() || null,
        category: draft.category.trim(),
        price: parsedPrice,
        updated_at: new Date().toISOString(),
      });
    });
  }

  function handleSetStatus(status: ProductStatus) {
    if (!selectedProduct) return;

    const warnings = getProductWarnings(selectedProduct);
    if (
      status === 'active' &&
      warnings.length > 0 &&
      !window.confirm(`สินค้านี้มีคำเตือน:\n- ${warnings.join('\n- ')}\n\nยืนยันเผยแพร่ต่อไหม`)
    ) {
      return;
    }

    startSaveTransition(async () => {
      const result = await setProductStatus(selectedProduct.id, status);

      if (!result.ok) {
        window.alert(result.error);
        return;
      }

      syncProduct({
        ...selectedProduct,
        status,
        updated_at: new Date().toISOString(),
      });
    });
  }

  function handleUniversalChange(isUniversal: boolean) {
    if (!selectedProduct) return;

    startSaveTransition(async () => {
      const result = await setProductUniversal(selectedProduct.id, isUniversal);

      if (!result.ok) {
        window.alert(result.error);
        return;
      }

      syncProduct({
        ...selectedProduct,
        is_universal: isUniversal,
        fitment: isUniversal ? [] : selectedProduct.fitment,
        updated_at: new Date().toISOString(),
      });
    });
  }

  function handleAddFitment(slug: string) {
    if (!selectedProduct || selectedProduct.fitment.includes(slug)) return;

    startSaveTransition(async () => {
      const result = await addProductFitment(selectedProduct.id, slug);

      if (!result.ok) {
        window.alert(result.error);
        return;
      }

      syncProduct({
        ...selectedProduct,
        is_universal: false,
        fitment: [...selectedProduct.fitment, slug].sort(),
        updated_at: new Date().toISOString(),
      });
      setModelQuery('');
      setModelResults([]);
    });
  }

  function handleRemoveFitment(slug: string) {
    if (!selectedProduct) return;

    startSaveTransition(async () => {
      const result = await removeProductFitment(selectedProduct.id, slug);

      if (!result.ok) {
        window.alert(result.error);
        return;
      }

      syncProduct({
        ...selectedProduct,
        fitment: selectedProduct.fitment.filter((item) => item !== slug),
        updated_at: new Date().toISOString(),
      });
    });
  }

  function handleApproveTrip(route: PendingTripRoute) {
    startSaveTransition(async () => {
      const result = await approveTripRoute(route.id);

      if (!result.ok) {
        window.alert(result.error);
        return;
      }

      setTrips((current) => current.filter((item) => item.id !== route.id));
      setTripError(null);
    });
  }

  function handleRejectTrip(route: PendingTripRoute) {
    if (!window.confirm(`ลบเส้นทาง "${route.name}" ออกจากคิวรออนุมัติถาวรใช่ไหม`)) {
      return;
    }

    startSaveTransition(async () => {
      const result = await rejectTripRoute(route.id);

      if (!result.ok) {
        window.alert(result.error);
        return;
      }

      setTrips((current) => current.filter((item) => item.id !== route.id));
      setTripError(null);
    });
  }

  return (
    <main className="min-h-screen bg-background text-on-surface">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-outline-variant pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-label text-sm text-primary">CraftBikeLab Admin</p>
            <h1 className="mt-2 font-headline text-3xl font-bold">จัดการข้อมูลก่อนขึ้นเว็บ</h1>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="สินค้า" value={products.length} />
            <Metric label="รอตรวจ" value={productCounts.pending} />
            <Metric label="เผยแพร่" value={productCounts.active} />
            <Metric label="ทริปรออนุมัติ" value={trips.length} />
          </div>
        </header>

        <nav className="flex flex-wrap gap-2" aria-label="Admin tabs">
          <TabButton
            active={activeTab === 'products'}
            label="สินค้า"
            count={products.length}
            onClick={() => setActiveTab('products')}
          />
          <TabButton
            active={activeTab === 'trips'}
            label="ทริปรออนุมัติ"
            count={trips.length}
            onClick={() => setActiveTab('trips')}
          />
        </nav>

        {activeTab === 'products' ? (
          <section className="flex flex-col gap-4">
            {productError ? (
              <ErrorBanner message={productError} onDismiss={() => setProductError(null)} />
            ) : null}

            <div className="flex flex-wrap gap-2">
              {FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`rounded border px-3 py-2 text-sm transition ${
                    filter === item.value
                      ? 'border-primary bg-primary text-on-primary'
                      : 'border-outline-variant bg-surface-container text-on-surface hover:border-primary'
                  }`}
                >
                  {item.label} ({productCounts[item.value]})
                </button>
              ))}
            </div>

            <div className="overflow-x-auto border border-outline-variant bg-surface-container-low">
              <table className="min-w-full divide-y divide-outline-variant text-sm">
                <thead className="bg-surface-container">
                  <tr className="text-left text-on-surface-variant">
                    <TableHead>สินค้า</TableHead>
                    <TableHead>แบรนด์</TableHead>
                    <TableHead>หมวด</TableHead>
                    <TableHead>ราคา</TableHead>
                    <TableHead>Fitment</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>จัดการ</TableHead>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="align-top hover:bg-surface-container">
                      <td className="w-[34rem] px-4 py-3">
                        <div className="flex min-w-0 gap-3">
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded bg-surface-container-high">
                            {product.image_urls[0] ? (
                              <img
                                src={product.image_urls[0]}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-on-surface-variant">
                                <PackageCheck size={20} aria-hidden="true" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="line-clamp-2 font-medium">{product.name}</p>
                            <p className="mt-1 truncate text-xs text-on-surface-variant">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">{product.brand ?? '-'}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{product.category}</td>
                      <td className="px-4 py-3">{formatPrice(product.price)}</td>
                      <td className="max-w-72 px-4 py-3">
                        <FitmentSummary product={product} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={product.status} />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => openProduct(product)}
                          className="inline-flex items-center gap-2 rounded border border-outline-variant px-3 py-2 text-sm hover:border-primary hover:text-primary"
                        >
                          <Pencil size={16} aria-hidden="true" />
                          แก้ไข
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="flex flex-col gap-4">
            {tripError ? (
              <ErrorBanner message={tripError} onDismiss={() => setTripError(null)} />
            ) : null}

            <div className="overflow-x-auto border border-outline-variant bg-surface-container-low">
              <table className="min-w-full divide-y divide-outline-variant text-sm">
                <thead className="bg-surface-container">
                  <tr className="text-left text-on-surface-variant">
                    <TableHead>เส้นทาง</TableHead>
                    <TableHead>ภาค</TableHead>
                    <TableHead>ผู้ส่ง</TableHead>
                    <TableHead>วันที่ส่ง</TableHead>
                    <TableHead>จัดการ</TableHead>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {trips.map((route) => (
                    <tr key={route.id} className="align-top hover:bg-surface-container">
                      <td className="max-w-xl px-4 py-3">
                        <p className="font-medium">{route.name}</p>
                        {route.description ? (
                          <p className="mt-1 line-clamp-2 text-on-surface-variant">{route.description}</p>
                        ) : null}
                        <a
                          href={route.maps_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          Google Maps
                          <ExternalLink size={14} aria-hidden="true" />
                        </a>
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">{route.region}</td>
                      <td className="px-4 py-3 text-on-surface-variant">
                        {route.submitted_by || route.submitted_via || '-'}
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">{formatDate(route.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleApproveTrip(route)}
                            className="inline-flex items-center gap-2 rounded bg-primary px-3 py-2 text-sm text-on-primary disabled:opacity-60"
                          >
                            <Check size={16} aria-hidden="true" />
                            อนุมัติ
                          </button>
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleRejectTrip(route)}
                            className="inline-flex items-center gap-2 rounded border border-error px-3 py-2 text-sm text-error disabled:opacity-60"
                          >
                            <Trash2 size={16} aria-hidden="true" />
                            ปฏิเสธ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {trips.length === 0 ? (
                <div className="px-4 py-12 text-center text-on-surface-variant">
                  ไม่มีเส้นทางรออนุมัติ
                </div>
              ) : null}
            </div>
          </section>
        )}
      </div>

      {selectedProduct && draft ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/70 p-0 sm:items-center sm:justify-center sm:p-6">
          <section className="max-h-[92vh] w-full overflow-y-auto border border-outline-variant bg-surface p-4 shadow-2xl sm:max-w-4xl sm:rounded sm:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-outline-variant pb-4">
              <div className="min-w-0">
                <p className="font-label text-sm text-primary">แก้ไขสินค้า #{selectedProduct.id}</p>
                <h2 className="mt-1 line-clamp-2 font-headline text-2xl font-bold">{selectedProduct.name}</h2>
              </div>
              <button
                type="button"
                onClick={closeProduct}
                className="rounded border border-outline-variant p-2 hover:border-primary hover:text-primary"
                aria-label="ปิด"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {selectedWarnings.length > 0 ? (
              <div className="mt-4 border border-secondary/50 bg-secondary/10 p-3 text-sm text-secondary">
                {selectedWarnings.map((warning) => (
                  <p key={warning}>{warning}</p>
                ))}
              </div>
            ) : null}

            <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_22rem]">
              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-2 text-sm">
                  ชื่อสินค้า
                  <input
                    value={draft.name}
                    onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                    className="rounded border border-outline-variant bg-surface-container px-3 py-2 text-on-surface outline-none focus:border-primary"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="flex flex-col gap-2 text-sm">
                    แบรนด์
                    <input
                      value={draft.brand}
                      onChange={(event) => setDraft({ ...draft, brand: event.target.value })}
                      className="rounded border border-outline-variant bg-surface-container px-3 py-2 text-on-surface outline-none focus:border-primary"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm">
                    หมวด
                    <input
                      value={draft.category}
                      onChange={(event) => setDraft({ ...draft, category: event.target.value })}
                      className="rounded border border-outline-variant bg-surface-container px-3 py-2 text-on-surface outline-none focus:border-primary"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm">
                    ราคา
                    <input
                      value={draft.price}
                      inputMode="decimal"
                      onChange={(event) => setDraft({ ...draft, price: event.target.value })}
                      className="rounded border border-outline-variant bg-surface-container px-3 py-2 text-on-surface outline-none focus:border-primary"
                    />
                  </label>
                </div>

                <div className="border border-outline-variant bg-surface-container-low p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-headline text-lg font-semibold">Fitment</h3>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedProduct.is_universal}
                        disabled={isSaving}
                        onChange={(event) => handleUniversalChange(event.target.checked)}
                        className="h-4 w-4 accent-primary"
                      />
                      ใส่ได้ทุกรุ่น
                    </label>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedProduct.is_universal ? (
                      <span className="rounded bg-primary px-2 py-1 text-xs text-on-primary">ทุกรุ่น</span>
                    ) : selectedProduct.fitment.length > 0 ? (
                      selectedProduct.fitment.map((slug) => (
                        <button
                          key={slug}
                          type="button"
                          disabled={isSaving}
                          onClick={() => handleRemoveFitment(slug)}
                          className="inline-flex items-center gap-1 rounded border border-outline-variant px-2 py-1 text-xs hover:border-error hover:text-error disabled:opacity-60"
                        >
                          {slug}
                          <X size={12} aria-hidden="true" />
                        </button>
                      ))
                    ) : (
                      <span className="text-sm text-on-surface-variant">ยังไม่ได้กำหนดรุ่น</span>
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="flex flex-col gap-2 text-sm">
                      ค้นหารุ่นรถ
                      <div className="relative">
                        <Search
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                          aria-hidden="true"
                        />
                        <input
                          value={modelQuery}
                          onChange={(event) => setModelQuery(event.target.value)}
                          placeholder="เช่น adv350, PCX, clck160"
                          className="w-full rounded border border-outline-variant bg-surface-container py-2 pl-9 pr-3 text-on-surface outline-none focus:border-primary"
                        />
                      </div>
                    </label>

                    <div className="mt-2 max-h-56 overflow-y-auto border border-outline-variant bg-surface">
                      {isSearching ? (
                        <div className="flex items-center gap-2 px-3 py-3 text-sm text-on-surface-variant">
                          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                          กำลังค้นหา
                        </div>
                      ) : modelResults.length > 0 ? (
                        modelResults.map((model) => (
                          <button
                            key={model.slug}
                            type="button"
                            disabled={isSaving || selectedProduct.fitment.includes(model.slug)}
                            onClick={() => handleAddFitment(model.slug)}
                            className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-surface-container disabled:opacity-50"
                          >
                            <span>
                              <span className="font-medium">{model.slug}</span>
                              <span className="ml-2 text-on-surface-variant">
                                {model.brand} {model.model}
                              </span>
                            </span>
                            <Plus size={16} aria-hidden="true" />
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-3 text-sm text-on-surface-variant">
                          พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหา
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <aside className="flex flex-col gap-3 border border-outline-variant bg-surface-container-low p-4">
                <StatusBadge status={selectedProduct.status} />
                <a
                  href={selectedProduct.shopee_link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  เปิด Shopee
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveProduct}
                  className="inline-flex items-center justify-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-on-primary disabled:opacity-60"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}
                  บันทึกข้อมูล
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSetStatus('active')}
                  className="inline-flex items-center justify-center gap-2 rounded border border-primary px-4 py-2 text-sm text-primary disabled:opacity-60"
                >
                  <PackageCheck size={16} aria-hidden="true" />
                  Publish
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSetStatus('pending')}
                  className="inline-flex items-center justify-center gap-2 rounded border border-outline-variant px-4 py-2 text-sm disabled:opacity-60"
                >
                  <RotateCcw size={16} aria-hidden="true" />
                  กลับเป็น Pending
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSetStatus('archived')}
                  className="inline-flex items-center justify-center gap-2 rounded border border-error px-4 py-2 text-sm text-error disabled:opacity-60"
                >
                  <Archive size={16} aria-hidden="true" />
                  Archive
                </button>
              </aside>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-outline-variant bg-surface-container px-3 py-2">
      <p className="text-xs text-on-surface-variant">{label}</p>
      <p className="font-headline text-xl font-bold">{value}</p>
    </div>
  );
}

function TabButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded border px-4 py-2 text-sm transition ${
        active
          ? 'border-primary bg-primary text-on-primary'
          : 'border-outline-variant bg-surface-container text-on-surface hover:border-primary'
      }`}
    >
      {label} ({count})
    </button>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}

function StatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span className={`inline-flex rounded border px-2 py-1 text-xs ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function FitmentSummary({ product }: { product: AffiliateProduct }) {
  if (product.is_universal) {
    return <span className="rounded bg-primary px-2 py-1 text-xs text-on-primary">ทุกรุ่น</span>;
  }

  if (product.fitment.length === 0) {
    return <span className="text-on-surface-variant">ยังไม่กำหนด</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {product.fitment.slice(0, 4).map((slug) => (
        <span key={slug} className="rounded border border-outline-variant px-2 py-1 text-xs">
          {slug}
        </span>
      ))}
      {product.fitment.length > 4 ? (
        <span className="rounded border border-outline-variant px-2 py-1 text-xs">
          +{product.fitment.length - 4}
        </span>
      ) : null}
    </div>
  );
}

function ErrorBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border border-error bg-error-container px-4 py-3 text-sm text-on-error-container">
      <span>{message}</span>
      <button type="button" onClick={onDismiss} className="rounded border border-on-error-container/40 p-1">
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
