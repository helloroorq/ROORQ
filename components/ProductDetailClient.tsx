'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';
import StartConversationButton from '@/components/messages/StartConversationButton';
import { formatINR } from '@/lib/utils/currency';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StoryScoreBreakdown {
  label: string;
  score: number;
}

interface StoryScoreTimeline {
  label: string;
  text: string;
}

interface StoryScore {
  total: number;
  breakdown?: StoryScoreBreakdown[];
  timeline?: StoryScoreTimeline[];
  tags?: string[];
  vendorNote?: string;
}

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
  story_score?: StoryScore | null;
}

interface Props {
  product: Product;
  store: Store | null;
  storeName: string | undefined;
  availableStock: number;
  savings: number;
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const LeafIcon = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
    <path d="M4 14C4 14 4 8 10 4c4-2.5 5-1 5-1s1 1-1 5c-4 6-10 6-10 6z" stroke="#2d6a4f" strokeWidth="1.5" fill="#d8f3dc" strokeLinejoin="round"/>
    <path d="M4 14c2-2 4-4 7-6" stroke="#2d6a4f" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const StarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
    <path d="M6 1l1.3 2.6 2.9.4-2.1 2 .5 2.9L6 7.6 3.4 8.9l.5-2.9-2.1-2 2.9-.4L6 1z" fill="#2d6a4f"/>
  </svg>
);

const ChevronDown = ({ open }: { open: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}>
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ScoreRing = ({ score, size = 52 }: { score: number; size?: number }) => {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const pct = score / 10;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e8f5e9" strokeWidth="4"/>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2d6a4f" strokeWidth="4"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"/>
    </svg>
  );
};

const BarFill = ({ score, max = 10 }: { score: number; max?: number }) => (
  <div style={{ flex: 1, height: 6, background: '#e8f5e9', borderRadius: 3, overflow: 'hidden' }}>
    <div style={{ width: `${(score / max) * 100}%`, height: '100%', background: '#2d6a4f', borderRadius: 3 }}/>
  </div>
);

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
  const [storyOpen, setStoryOpen] = useState(false);
  const storyRef = useRef<HTMLDivElement>(null);

  const images = product.images && product.images.length > 0 ? product.images : [];
  const ss = product.story_score;

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

          {/* Price + Story badge */}
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

            {ss && (
              <button
                onClick={() => {
                  setStoryOpen(o => !o);
                  setTimeout(() => storyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#d8f3dc', padding: '5px 14px', borderRadius: 20, cursor: 'pointer', border: '1px solid #b7e4c7' }}
                className="story-badge-btn">
                <LeafIcon />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1b4332' }}>{ss.total}</span>
                <span style={{ fontSize: 12, color: '#2d6a4f', fontWeight: 500 }}>Story Score</span>
              </button>
            )}
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

          {/* ── STORY SCORE ────────────────────────────────────────── */}
          {ss && (
            <div ref={storyRef} style={{ background: 'linear-gradient(135deg, #f0faf1 0%, #d8f3dc 100%)', border: '1px solid #b7e4c7', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>

              {/* Header */}
              <button
                onClick={() => setStoryOpen(o => !o)}
                style={{ width: '100%', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {/* Score ring */}
                  <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
                    <ScoreRing score={ss.total} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#1b4332', lineHeight: 1 }}>{ss.total}</span>
                      <span style={{ fontSize: 8, color: '#2d6a4f', fontWeight: 500 }}>/10</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#1b4332' }}>Story Score</span>
                      <StarIcon />
                    </div>
                    {ss.tags && ss.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {ss.tags.slice(0, 3).map(t => (
                          <span key={t} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 12, background: '#b7e4c7', color: '#1b4332', fontWeight: 500 }}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ color: '#2d6a4f', flexShrink: 0 }}>
                  <ChevronDown open={storyOpen} />
                </div>
              </button>

              {/* Expandable body */}
              <div style={{ maxHeight: storyOpen ? 600 : 0, overflow: 'hidden', transition: 'max-height 0.4s ease' }}>
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid #b7e4c7' }}>

                  {/* Score breakdown */}
                  {ss.breakdown && ss.breakdown.length > 0 && (
                    <div style={{ paddingTop: 16, marginBottom: 20 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#2d6a4f', marginBottom: 10 }}>
                        Score breakdown
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {ss.breakdown.map(b => (
                          <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 12, color: '#1b4332', width: 130, flexShrink: 0, fontWeight: 500 }}>{b.label}</span>
                            <BarFill score={b.score} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#1b4332', width: 32, textAlign: 'right' }}>{b.score}/10</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  {ss.timeline && ss.timeline.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#2d6a4f', marginBottom: 12 }}>
                        Item journey
                      </p>
                      {ss.timeline.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: i < (ss.timeline?.length ?? 0) - 1 ? 14 : 0 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2d6a4f', border: '2px solid #1b4332', zIndex: 1 }}/>
                            {i < (ss.timeline?.length ?? 0) - 1 && (
                              <div style={{ width: 2, flex: 1, background: '#95d5b2', marginTop: 2 }}/>
                            )}
                          </div>
                          <div style={{ paddingBottom: 2 }}>
                            <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#52b788', marginBottom: 2 }}>{item.label}</p>
                            <p style={{ fontSize: 13, color: '#1b4332', lineHeight: 1.5 }}>{item.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Vendor note */}
                  {ss.vendorNote && (
                    <div style={{ background: '#b7e4c7', borderRadius: 8, padding: '12px 16px', marginBottom: 14 }}>
                      <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#2d6a4f', marginBottom: 4 }}>Vendor note</p>
                      <p style={{ fontSize: 12, color: '#1b4332', lineHeight: 1.6, fontStyle: 'italic' }}>&ldquo;{ss.vendorNote}&rdquo;</p>
                    </div>
                  )}

                  {/* Tags */}
                  {ss.tags && ss.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {ss.tags.map(t => (
                        <span key={t} style={{ fontSize: 11, padding: '4px 12px', borderRadius: 14, background: '#fff', color: '#1b4332', fontWeight: 500, border: '1px solid #95d5b2' }}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

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
        .story-badge-btn:hover {
          background: #b7e4c7 !important;
        }
      `}</style>
    </div>
  );
}
