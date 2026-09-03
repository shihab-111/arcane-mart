'use client';
import Link from 'next/link';
import { useCart } from './CartContext';
import { tk } from '@/lib/utils';

export default function CartDrawer() {
  const cart = useCart();
  return (
    <>
      <div onClick={() => cart.setOpen(false)}
        className={`fixed inset-0 bg-ink/45 z-50 transition ${cart.open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
      <aside aria-label="Shopping cart"
        className={`fixed top-0 right-0 h-full w-[min(380px,88vw)] bg-white z-[60] flex flex-col transition-transform ${cart.open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-line">
          <h3 className="font-bold">Your cart ({cart.count})</h3>
          <button onClick={() => cart.setOpen(false)} className="p-2 rounded-lg hover:bg-leaf-soft" aria-label="Close cart">✕</button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {cart.items.length === 0 && (
            <p className="text-ink-soft text-center py-12">Your cart is empty. Browse the shop to get started.</p>
          )}
          {cart.items.map((l) => (
            <div key={l.id} className="flex gap-3 items-center text-sm">
              <img src={l.image || '/placeholder.svg'} alt="" className="w-14 h-14 rounded-lg object-cover bg-wash" />
              <div className="flex-1">
                <Link href={`/products/${l.slug}`} onClick={() => cart.setOpen(false)} className="font-medium line-clamp-2 hover:text-leaf-deep">{l.name}</Link>
                <div className="text-ink-soft">{tk(l.price)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => cart.setQty(l.id, l.qty - 1)} className="w-7 h-7 rounded-lg bg-leaf-soft text-leaf-deep font-bold" aria-label="Decrease">−</button>
                <span className="w-5 text-center">{l.qty}</span>
                <button onClick={() => cart.setQty(l.id, l.qty + 1)} className="w-7 h-7 rounded-lg bg-leaf-soft text-leaf-deep font-bold" aria-label="Increase">+</button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-line">
          <div className="flex justify-between font-extrabold mb-3"><span>Subtotal</span><span>{tk(cart.subtotal)}</span></div>
          <Link href="/checkout" onClick={() => cart.setOpen(false)}
            className={`btn-leaf w-full ${cart.items.length ? '' : 'pointer-events-none opacity-50'}`}>Checkout</Link>
        </div>
      </aside>
    </>
  );
}
