'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatINR } from '@/lib/utils/currency';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  size: string;
  reserved_quantity?: number;
  stock_quantity?: number;
}

export default function ProductCard({ product }: { product: Product }) {
  const stockQuantity = Math.max(0, Number(product.stock_quantity ?? 0));
  const reservedQuantity = Math.max(0, Number(product.reserved_quantity ?? 0));
  const availableStock = Math.max(0, stockQuantity - reservedQuantity);
  const isSoldOut = availableStock <= 0;

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] bg-gray-100 mb-4 overflow-hidden">
        {product.images?.[0] && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 20vw"
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        )}
        {isSoldOut && (
          <div className="absolute top-4 right-4 bg-black text-white text-xs font-bold px-3 py-1 uppercase tracking-widest">
            Sold Out
          </div>
        )}
      </div>
      <div>
        <h3 className="font-bold text-sm uppercase tracking-wide mb-1">{product.name}</h3>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">{product.size}</p>
          <p className="font-mono font-medium">{formatINR(product.price)}</p>
        </div>
      </div>
    </Link>
  );
}
