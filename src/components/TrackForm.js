'use client';
import { useState } from 'react';
import { tk, statusColor } from '@/lib/utils';

export default function TrackForm() {
  const [orderNo, setOrderNo] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError(''); setOrder(null);
    const res = await fetch('/api/orders/track', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNo, phone }),
    });
    const json = await res.json();
    if (json.ok) setOrder(json.data); else setError(json.error);
    setBusy(false);
  }

  return (
    <div className="wrap py-10 max-w-xl">
      <h1 className="heading mb-4">Track your order</h1>
      <form onSubmit={submit} className="card p-4 grid gap-3">
        <div><label className="label" htmlFor="o">Order number</label><input id="o" required className="field" placeholder="AM-20260903-1234" value={orderNo} onChange={(e) => setOrderNo(e.target.value)} /></div>
        <div><label className="label" htmlFor="ph">Mobile number used on the order</label><input id="ph" required className="field" placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        <button disabled={busy} className="btn-leaf">{busy ? 'Checking…' : 'Find my order'}</button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {order && (
        <div className="card p-4 mt-5">
          <div className="flex justify-between items-center">
            <b>{order.orderNo}</b>
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor[order.status]}`}>{order.status}</span>
          </div>
          <p className="text-sm text-ink-soft mt-1">Placed {new Date(order.createdAt).toLocaleDateString()}</p>
          <ul className="mt-3 text-sm space-y-1">
            {order.items.map((l, i) => <li key={i} className="flex justify-between"><span>{l.name} × {l.qty}</span><span>{tk(l.price * l.qty)}</span></li>)}
          </ul>
          <div className="flex justify-between font-extrabold mt-3 pt-3 border-t border-line"><span>Total</span><span>{tk(order.total)}</span></div>
        </div>
      )}
    </div>
  );
}
