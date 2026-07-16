import { getProductsForAdmin } from '@/lib/shop-products';
import AdminProductsClient from './AdminProductsClient';
import { getPendingTripRoutes } from './trip-actions';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const [productsResult, tripsResult] = await Promise.all([
    getProductsForAdmin(),
    getPendingTripRoutes(),
  ]);

  return (
    <AdminProductsClient
      initialProducts={productsResult.products}
      initialProductError={productsResult.error}
      initialTrips={tripsResult.routes}
      initialTripError={tripsResult.error}
    />
  );
}
