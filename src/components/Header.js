'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCart } from './CartContext';
import CartDrawer from './CartDrawer';

export default function Header({ categories = [], settings = {} }) {
  const cart = useCart();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [menu, setMenu] = useState(false);

  function search(e) {
    e.preventDefault();
    if (q.trim()) router.push(`/products?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <>
      <div className="bg-leaf-deep text-white text-xs md:text-sm">
        <div className="wrap flex items-center justify-between py-2 gap-3">
          <span>🚚 {settings.announcement || 'Fast delivery all over Bangladesh — cash on delivery'}</span>
          <span className="hidden md:block">
            <Link href="/track" className="hover:underline">Track order</Link>
            {settings.phone ? <> · <a href={`tel:${settings.phone}`} className="hover:underline">{settings.phone}</a></> : null}
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-white border-b border-line">
        <div className="wrap flex items-center gap-3 py-2.5">
          <button className="lg:hidden p-2 rounded-lg hover:bg-leaf-soft" onClick={() => setMenu(!menu)} aria-label="Menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          </button>

          <Link href="/" className="shrink-0">
            {settings.logo
              ? <img src={settings.logo} alt={settings.siteName || 'Arcane Mart'} className="h-10 w-auto" />
              : <span className="text-lg font-extrabold tracking-tight">ARCANE <span className="text-leaf-deep">MART</span></span>}
          </Link>

          <form onSubmit={search} className="hidden md:block flex-1 relative">
            <input value={q} onChange={(e) => setQ(e.target.value)} className="field bg-wash rounded-full pr-12"
              placeholder="Search spices, figures, gadgets…" aria-label="Search products" />
            <button className="absolute right-1.5 top-1.5 bottom-1.5 w-10 rounded-full bg-leaf text-white grid place-items-center" aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            </button>
          </form>

          <div className="ml-auto flex items-center gap-1">
            <Link href="/track" className="p-2.5 rounded-lg hover:bg-leaf-soft hidden sm:block" aria-label="Track order">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            </Link>
            <button onClick={() => cart.setOpen(true)} className="relative p-2.5 rounded-lg hover:bg-leaf-soft" aria-label="Open cart">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="10" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/></svg>
              <span className="absolute top-1 right-0.5 min-w-[19px] h-[19px] px-1 rounded-full bg-leaf-deep text-white text-[11px] font-bold grid place-items-center">{cart.count}</span>
            </button>
          </div>
        </div>

        <nav className="hidden lg:block border-t border-line">
          <div className="wrap flex gap-1 overflow-x-auto">
            <Link href="/products" className="px-3 py-2.5 text-sm font-semibold whitespace-nowrap border-b-[3px] border-transparent hover:text-leaf-deep hover:border-leaf">All products</Link>
            {categories.slice(0, 9).map((c) => (
              <Link key={c._id} href={`/category/${c.slug}`} className="px-3 py-2.5 text-sm font-semibold whitespace-nowrap border-b-[3px] border-transparent hover:text-leaf-deep hover:border-leaf">
                {c.emoji} {c.name}
              </Link>
            ))}
          </div>
        </nav>

        {menu && (
          <div className="lg:hidden border-t border-line bg-white max-h-[70vh] overflow-auto">
            <form onSubmit={search} className="p-3 md:hidden">
              <input value={q} onChange={(e) => setQ(e.target.value)} className="field bg-wash" placeholder="Search products…" />
            </form>
            <Link href="/products" onClick={() => setMenu(false)} className="block px-4 py-3 border-t border-line font-semibold">All products</Link>
            {categories.map((c) => (
              <Link key={c._id} href={`/category/${c.slug}`} onClick={() => setMenu(false)} className="block px-4 py-3 border-t border-line">
                {c.emoji} {c.name}
              </Link>
            ))}
            <Link href="/track" onClick={() => setMenu(false)} className="block px-4 py-3 border-t border-line">Track order</Link>
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  );
}
