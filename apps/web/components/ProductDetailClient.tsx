'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';
import StartConversationButton from '@/components/messages/StartConversationButton';
import { formatINR } from '@/lib/utils/currency';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Store {
  id: string;
  store_name?: string | null;
  business_name?: string | null;
  store_description?: string | null;
}

interface Product {
  id: string;
  name: string;
  brand?: string | null;
  price: number;
  retail_price?: number | null;
  size?: string | null;
  condition?: string | null;
  category?: string | null;
  material?: string | null;
  color?: string | null;
  description?: string | null;
  images?: string[] | null;
  vendor_id?: string | null;
  stock_quantity: number;
  reserved_quantity: number;
}

interface Props {
  product: Product;
  store: Store | null;
  storeName: string | undefined;
  availableStock: number;
  savings: number;
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5L2.5 4v4c0 3.5 2.3 5.5 5.5 7 3.2-1.5 5.5-3.5 5.5-7V4L8 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    <path d="M6 8l1.5 1.5L10.5 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TruckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M1 3h9v7H1zM10 6h2.5L14 8v2h-4V6z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    <circle cx="4" cy="11.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="12" cy="11.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
  </svg>
);

const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.5 3.5l1.4 1.4M11.1 11.1l1.4 1.4M12.5 3.5l-1.4 1.4M4.9 11.1l-1.4 1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const ReturnIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 7l-2.5 2.5L4 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1.5 9.5H10a3.5 3.5 0 100-7H7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductDetailClient({ product, store, storeName, availableStock, savings }: Props) {
  const [activeImg, setActiveImg] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);

  const images = product.images && product.images.length > 0 ? product.images : [];

  const trustBadges = [
    { icon: <ShieldIcon />, title: 'Authentic', desc: 'Verified by our experts for authenticity and quality.' },
    { icon: <TruckIcon />, title: '24h Delivery', desc: 'Direct to your hostel within 24 hours.' },
    { icon: <SparkleIcon />, title: 'Cleaned', desc: 'Laundered and ready to wear.' },
    { icon: <ReturnIcon />, title: 'Easy Returns', desc: '48-hour hassle-free returns.' },
  ];

  return (
    <div style={{ background: '#FAF8F4', minHeight: '100vh' }}>

      {/* BREADCRUMB */}
      <div style={{ padding: '12px 24px', fontSize: 12, color: '#999', display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <Link href="/" style={{ color: '#999', textDecoration: 'none' }} className="hover:text-black">Home</Link>
        <span>/</span>
        <Link href="/shop" style={{ color: '#999', textDecoration: 'none' }} className="hover:text-black">Shop</Link>
        <span>/</span>
        {product.category && (
          <>
            <span style={{ cursor: 'default' }}>{product.category}</span>
            <span>/</span>
          </>
        )}
        <span style={{ color: '#0D0D0D' }}>{product.name}</span>
      </div>

      {/* MAIN GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0, maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}
        className="product-grid">

        {/* LEFT — IMAGES */}
        <div style={{ paddingRight: 40, position: 'sticky', top: 80, alignSelf: 'start' }} className="product-images-col">
          {images.length > 0 ? (
            <>
              <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#eee', aspectRatio: '4/5' }}>
                {/* Vintage tag */}
                <div style={{ position: 'absolute', top: 12, left: 12, background: '#0D0D0D', color: '#FAF8F4', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: 4, zIndex: 2 }}>
                  Vintage
                </div>
                <Image
                  src={images[activeImg]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  onLoad={() => setImgLoaded(true)}
                  style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
                />
              </div>
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  {images.map((img, i) => (
                    <button key={i} onClick={() => { setImgLoaded(false); setActiveImg(i); }}
                      style={{ width: 72, height: 90, borderRadius: 6, overflow: 'hidden', border: i === activeImg ? '2px solid #0D0D0D' : '2px solid transparent', cursor: 'pointer', background: 'none', padding: 0, transition: 'border 0.15s', flexShrink: 0 }}>
                      <Image src={img} alt={`${product.name} ${i + 1}`} width={72} height={90} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ aspectRatio: '4/5', background: '#f0ede8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              No Image Available
            </div>
          )}
        </div>

        {/* RIGHT — DETAILS */}
        <div style={{ paddingLeft: 20 }}>

          {/* Brand + Name */}
          {product.brand && (
            <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#999', marginBottom: 6 }}>
              {product.brand}
            </p>
          )}
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0D0D0D', margin: '0 0 10px', lineHeight: 1.2 }}>
            {product.name}
          </h1>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 26, fontWeight: 700, color: '#0D0D0D' }}>{formatINR(product.price)}</span>
              {product.retail_price && product.retail_price > product.price && (
                <>
                  <span style={{ fontSize: 16, color: '#aaa', textDecoration: 'line-through' }}>{formatINR(product.retail_price)}</span>
                  <span style={{ background: '#C0392B', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>-{savings}%</span>
                </>
              )}
            </div>
          </div>

          {/* Size */}
          <div style={{ border: '1px solid #e8e6e1', borderRadius: 8, padding: '14px 18px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0D0D0D', marginBottom: 6 }}>Size</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: '#0D0D0D', color: '#FAF8F4', fontSize: 13, fontWeight: 600, padding: '4px 14px', borderRadius: 4 }}>
                  {product.size || 'Free'}
                </span>
                <span style={{ fontSize: 12, color: '#999', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {availableStock > 0 ? 'Single item in stock' : 'Out of stock'}
                </span>
              </div>
            </div>
            <Link href="/sizing" style={{ fontSize: 12, color: '#C0392B', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 2 }}>
              Size guide
            </Link>
          </div>

          {/* Seller */}
          {store && storeName && (
            <div style={{ border: '1px solid #e8e6e1', borderRadius: 8, padding: '12px 18px', marginBottom: 16, background: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#999', marginBottom: 2 }}>Sold by</p>
                <Link href={`/stores/${store.id}`} style={{ fontSize: 14, fontWeight: 600, color: '#0D0D0D', textDecoration: 'none' }} className="hover:underline">
                  {storeName}
                </Link>
                {store.store_description && (
                  <p style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{store.store_description}</p>
                )}
              </div>
            </div>
          )}

          {/* Add to Cart */}
          <div style={{ marginBottom: 20 }}>
            <AddToCartButton productId={product.id} disabled={availableStock === 0} />
            {product.vendor_id && (
              <div style={{ marginTop: 10 }}>
                <StartConversationButton
                  sellerId={product.vendor_id}
                  productId={product.id}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-gray-300 hover:bg-gray-50"
                />
              </div>
            )}
            {availableStock === 0 && (
              <p style={{ fontSize: 11, color: '#C0392B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', marginTop: 6 }}>
                Sold Out
              </p>
            )}
          </div>

          {/* Trust Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
            {trustBadges.map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ color: '#0D0D0D', marginTop: 1, flexShrink: 0 }}>{b.icon}</div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#0D0D0D', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{b.title}</p>
                  <p style={{ fontSize: 11, color: '#999', lineHeight: 1.4 }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div style={{ borderTop: '1px solid #e8e6e1', paddingTop: 20, marginBottom: 24 }}>
            <h3 style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0D0D0D', marginBottom: 10 }}>
              Description
            </h3>
            {product.description && (
              <p style={{ fontSize: 14, lineHeight: 1.7, color: '#555', marginBottom: 16 }}>{product.description}</p>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, fontSize: 12 }}>
              {([
                ['Material', product.material],
                ['Color', product.color],
                ['Category', product.category],
                ['Condition', product.condition || 'Excellent Vintage'],
              ] as [string, string | null | undefined][]).map(([label, val]) => val ? (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0ede8' }}>
                  <span style={{ color: '#999', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>{label}</span>
                  <span style={{ color: '#0D0D0D', fontWeight: 500 }}>{val}</span>
                </div>
              ) : null)}
            </div>
          </div>

          {/* Campus note */}
          <div style={{ background: '#fff', border: '1px solid #e8e6e1', borderRadius: 8, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FAF8F4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #e8e6e1' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L1 5l7 4 7-4-7-4zM1 11l7 4 7-4M1 8l7 4 7-4" stroke="#0D0D0D" strokeWidth="1.2" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#0D0D0D', marginBottom: 2 }}>Campus curated</p>
              <p style={{ fontSize: 11, color: '#999' }}>Every piece verified. Available for IIT Roorkee campus delivery.</p>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .product-grid {
            grid-template-columns: 1fr !important;
          }
          .product-images-col {
            padding-right: 0 !important;
          }
        }

      `}</style>
    </div>
  );
}
