'use client';
import Link from 'next/link';
import { useCart } from './CartContext';
import { tk } from '@/lib/utils';

export default function CartView() {
  const cart = useCart();
  if (!cart.ready) return <div className="wrap py-16 text-center text-ink-soft">Loading…</div>;

  return (
    <div className="wrap py-8">
      <h1 className="heading mb-5">Your cart</h1>
      {cart.items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-ink-soft mb-4">Your cart is empty.</p>
          <Link href="/products" className="btn-leaf">Browse products</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-3">
            {cart.items.map((l) => (
              <div key={l.id} className="card p-3 flex gap-3 items-center">
                <img src={l.image || ''} alt="" className="w-20 h-20 rounded-lg object-cover bg-wash" />
                <div className="flex-1">
                  <Link href={`/products/${l.slug}`} className="font-semibold hover:text-leaf-deep">{l.name}</Link>
                  <div className="text-ink-soft text-sm">{tk(l.price)} each</div>
                  <button onClick={() => cart.remove(l.id)} className="text-red-600 text-xs mt-1 hover:underline">Remove</button>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => cart.setQty(l.id, l.qty - 1)} className="w-8 h-8 rounded-lg bg-leaf-soft text-leaf-deep font-bold">−</button>
                  <span className="w-6 text-center">{l.qty}</span>
                  <button onClick={() => cart.setQty(l.id, l.qty + 1)} className="w-8 h-8 rounded-lg bg-leaf-soft text-leaf-deep font-bold">+</button>
                </div>
                <div className="w-24 text-right font-extrabold">{tk(l.price * l.qty)}</div>
              </div>
            ))}
          </div>
          <aside className="card p-4 h-fit">
            <div className="flex justify-between mb-2"><span>Subtotal</span><b>{tk(cart.subtotal)}</b></div>
            <p className="text-xs text-ink-soft mb-4">Delivery charge is calculated at checkout. Free above ৳1,500.</p>
            <Link href="/checkout" className="btn-leaf w-full">Proceed to checkout</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
