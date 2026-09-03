'use client';
import Link from 'next/link';
import { useCart } from './CartContext';
import { tk } from '@/lib/utils';

export default function ProductCard({ product }) {
  const cart = useCart();
  const off = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;
  const out = product.stock <= 0;

  return (
    <article className="card flex flex-col hover:shadow-lg transition-shadow">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square bg-wash">
        {product.images?.[0]
          ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
          : <span className="w-full h-full grid place-items-center text-4xl">🛍️</span>}
        {off > 0 && <span className="absolute top-2 left-2 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded">-{off}%</span>}
        {out && <span className="absolute inset-0 bg-white/70 grid place-items-center font-bold text-ink-soft">Out of stock</span>}
      </Link>
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <span className="text-[11px] text-ink-soft">{product.category?.name}</span>
        <Link href={`/products/${product.slug}`} className="text-sm font-semibold leading-snug line-clamp-2 hover:text-leaf-deep">{product.name}</Link>
        <div className="mt-auto flex items-baseline gap-2 flex-wrap">
          <span className="font-extrabold text-leaf-deep">{tk(product.price)}</span>
          {product.comparePrice ? <span className="text-xs text-ink-soft line-through">{tk(product.comparePrice)}</span> : null}
        </div>
        <button disabled={out} onClick={() => cart.add(product)}
          className="w-full py-2 rounded-lg bg-leaf-soft text-leaf-deep font-bold text-sm hover:bg-leaf hover:text-white disabled:opacity-50 disabled:hover:bg-leaf-soft disabled:hover:text-leaf-deep">
          {out ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}
