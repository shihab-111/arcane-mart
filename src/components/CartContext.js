'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartCtx = createContext(null);
const KEY = 'am_cart_v1';

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(KEY, JSON.stringify(items)); }, [items, ready]);

  const api = useMemo(() => ({
    items, ready, open, setOpen,
    add(product, qty = 1) {
      const max = Math.min(99, product.stock ?? 99);
      setItems((prev) => {
        const i = prev.findIndex((l) => l.id === String(product._id));
        if (i > -1) {
          const c = [...prev];
          c[i] = { ...c[i], qty: Math.min(max, c[i].qty + qty), max };
          return c;
        }
        return [...prev, {
          id: String(product._id), name: product.name, slug: product.slug,
          price: product.price, image: product.images?.[0] || '', qty: Math.min(max, qty), max,
        }];
      });
      setOpen(true);
    },
    setQty(id, qty) {
      setItems((prev) => prev.flatMap((l) => {
        if (l.id !== id) return [l];
        if (qty < 1) return [];
        return [{ ...l, qty: Math.min(l.max ?? 99, qty) }];
      }));
    },
    remove(id) { setItems((prev) => prev.filter((l) => l.id !== id)); },
    clear() { setItems([]); },
    get count() { return items.reduce((s, l) => s + l.qty, 0); },
    get subtotal() { return items.reduce((s, l) => s + l.price * l.qty, 0); },
  }), [items, ready, open]);

  return <CartCtx.Provider value={api}>{children}</CartCtx.Provider>;
}

export const useCart = () => useContext(CartCtx);
