import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StructuredData from '@/components/StructuredData';
import { buildMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema, productSchema } from '@/lib/seo/schema';
import { notFound } from 'next/navigation';
import { logger } from '@/lib/logger';
import { fetchApprovedStoreById } from '@/lib/marketplace/public';
import ProductDetailClient from '@/components/ProductDetailClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const getProduct = async (id: string) => {
  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .eq('approval_status', 'approved')
    .maybeSingle();

  if (error) {
    logger.error('Product detail query failed', {
      productId: id,
      message: error.message,
      code: error.code,
    });
  }

  return product;
};

const getStore = async (vendorId: string | null | undefined) => {
  if (!vendorId) {
    return null;
  }

  return fetchApprovedStoreById(vendorId);
};

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const product = await getProduct(params.id);

  if (!product) {
    return buildMetadata({
      title: 'Product not found',
      description: 'The requested product could not be found.',
      path: `/products/${params.id}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: product.name,
    description: product.description || 'Vintage fashion item from Roorq.',
    path: `/products/${product.id}`,
    image: product.images?.[0],
    keywords: [product.name, product.category, product.brand].filter(Boolean) as string[],
  });
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  const savings = product.retail_price
    ? Math.round(((product.retail_price - product.price) / product.retail_price) * 100)
    : 0;

  const availableStock = product.stock_quantity - product.reserved_quantity;
  const store = await getStore(product.vendor_id);
  const storeName = store?.store_name ?? store?.business_name ?? undefined;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FAF8F4' }}>
      <StructuredData
        data={[
          productSchema({
            id: product.id,
            name: product.name,
            description: product.description,
            images: product.images,
            price: product.price,
            brand: product.brand,
            category: product.category,
            inStock: availableStock > 0,
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Shop', path: '/shop' },
            { name: product.name, path: `/products/${product.id}` },
          ]),
        ]}
      />
      <Navbar />
      <div className="flex-1">
        <ProductDetailClient
          product={product}
          store={store}
          storeName={storeName}
          availableStock={availableStock}
          savings={savings}
        />
      </div>
      <Footer />
    </div>
  );
}
