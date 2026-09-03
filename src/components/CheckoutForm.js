'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from './CartContext';
import { tk, calcShipping } from '@/lib/utils';

export default function CheckoutForm({ settings }) {
  const cart = useCart();
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: 'Dhaka', note: '' });
  const [payment, setPayment] = useState('cod');
  const [paymentRef, setRef] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const insideDhaka = /dhaka/i.test(form.city);
  const shipping = calcShipping(cart.subtotal, form.city, settings);

  async function submit(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: form,
          items: cart.items.map((l) => ({ product: l.id, qty: l.qty })),
          paymentMethod: payment,
          paymentRef,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        const detail = json.issues?.[0]?.message;
        throw new Error(detail ? `${json.error}: ${detail}` : json.error || 'Order failed');
      }
      setDone(json.data);
      cart.clear();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="wrap py-16 text-center">
        <div className="text-5xl mb-3">✅</div>
        <h1 className="text-2xl font-extrabold">Order placed</h1>
        <p className="mt-2">Your order number is <b className="text-leaf-deep">{done.orderNo}</b>. We&apos;ll call you shortly to confirm.</p>
        <p className="text-ink-soft mt-1">Amount payable: {tk(done.total)}</p>
        <div className="flex gap-3 justify-center mt-6">
          <Link href="/track" className="btn-leaf">Track this order</Link>
          <Link href="/products" className="btn-ghost">Keep shopping</Link>
        </div>
      </div>
    );
  }

  if (cart.ready && cart.items.length === 0) {
    return (
      <div className="wrap py-16 text-center">
        <p className="text-ink-soft mb-4">Your cart is empty.</p>
        <Link href="/products" className="btn-leaf">Browse products</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="wrap py-8 grid lg:grid-cols-[1fr_340px] gap-6">
      <div>
        <h1 className="heading mb-5">Delivery details</h1>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label" htmlFor="n">Full name</label><input id="n" required className="field" value={form.name} onChange={set('name')} /></div>
          <div><label className="label" htmlFor="p">Mobile number</label><input id="p" required placeholder="01XXXXXXXXX" className="field" value={form.phone} onChange={set('phone')} /></div>
          <div className="sm:col-span-2"><label className="label" htmlFor="a">Full address</label><textarea id="a" required rows={3} className="field" value={form.address} onChange={set('address')} placeholder="House, road, area" /></div>
          <div><label className="label" htmlFor="c">City / district</label><input id="c" required className="field" value={form.city} onChange={set('city')} /></div>
          <div><label className="label" htmlFor="e">Email (optional)</label><input id="e" type="email" className="field" value={form.email} onChange={set('email')} /></div>
          <div className="sm:col-span-2"><label className="label" htmlFor="no">Note for us (optional)</label><input id="no" className="field" value={form.note} onChange={set('note')} /></div>
        </div>

        <h2 className="heading mt-8 mb-3">Payment</h2>
        <div className="grid gap-2">
          {[['cod', 'Cash on delivery'], ['bkash', 'bKash (send money, then enter TrxID)'], ['nagad', 'Nagad (send money, then enter TrxID)']].map(([v, label]) => (
            <label key={v} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${payment === v ? 'border-leaf bg-leaf-soft' : 'border-line'}`}>
              <input type="radio" name="pay" value={v} checked={payment === v} onChange={() => setPayment(v)} />
              <span>{label}</span>
            </label>
          ))}
          {payment !== 'cod' && (
            <input className="field" placeholder="Transaction ID" value={paymentRef} onChange={(e) => setRef(e.target.value)} />
          )}
        </div>
      </div>

      <aside className="card p-4 h-fit lg:sticky lg:top-24">
        <h2 className="font-bold mb-3">Order summary</h2>
        <div className="space-y-2 text-sm max-h-64 overflow-auto">
          {cart.items.map((l) => (
            <div key={l.id} className="flex justify-between gap-3">
              <span className="flex-1">{l.name} <span className="text-ink-soft">× {l.qty}</span></span>
              <span>{tk(l.price * l.qty)}</span>
            </div>
          ))}
        </div>
        <hr className="my-3 border-line" />
        <div className="flex justify-between text-sm"><span>Subtotal</span><span>{tk(cart.subtotal)}</span></div>
        <div className="flex justify-between text-sm"><span>Delivery{shipping === 0 ? ' (free)' : insideDhaka ? ' (inside Dhaka)' : ' (outside Dhaka)'}</span><span>{tk(shipping)}</span></div>
        <div className="flex justify-between font-extrabold text-lg mt-2"><span>Total</span><span>{tk(cart.subtotal + shipping)}</span></div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="btn-leaf w-full mt-4 disabled:opacity-60">{busy ? 'Placing order…' : 'Place order'}</button>
        <p className="text-xs text-ink-soft mt-2">By ordering you agree to our return and shipping policies.</p>
      </aside>
    </form>
  );
}
