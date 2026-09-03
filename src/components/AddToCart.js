'use client';
import { useState } from 'react';
import { useCart } from './CartContext';

export default function AddToCart({ product }) {
  const cart = useCart();
  const [qty, setQty] = useState(1);
  const out = product.stock <= 0;

  return (
    <div className="flex flex-wrap items-center gap-3 mt-5">
      <div className="flex items-center border border-line rounded-full overflow-hidden">
        <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-10 hover:bg-leaf-soft" aria-label="Decrease">−</button>
        <span className="w-10 text-center font-semibold">{qty}</span>
        <button onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))} className="w-10 h-10 hover:bg-leaf-soft" aria-label="Increase">+</button>
      </div>
      <button disabled={out} onClick={() => cart.add(product, qty)} className="btn-leaf disabled:opacity-50">
        {out ? 'Out of stock' : 'Add to cart'}
      </button>
    </div>
  );
}
