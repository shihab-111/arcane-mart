'use client';
import { useState } from 'react';
import { useFetch, api } from './useApi';
import { tk, statusColor, ORDER_STATUS } from '@/lib/utils';

const NEXT_ACTION = {
  pending: ['accepted', 'Accept order'],
  accepted: ['packed', 'Mark packed'],
  packed: ['shipped', 'Mark shipped'],
  shipped: ['delivered', 'Mark delivered'],
};

export default function OrdersAdmin() {
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState(null);
  const { data, loading, error, reload } = useFetch(`/api/orders?status=${status}&q=${encodeURIComponent(q)}`, [status, q]);

  async function setOrderStatus(id, next) {
    await api(`/api/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status: next }) });
    reload();
  }

  return (
    <div>
      <h1 className="heading mb-4">Orders</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        {['all', ...ORDER_STATUS].map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-full text-sm border capitalize ${status === s ? 'bg-leaf-deep text-white border-leaf-deep' : 'border-line bg-white hover:bg-leaf-soft'}`}>
            {s}
          </button>
        ))}
        <input className="field max-w-xs ml-auto" placeholder="Search order no, phone or name"
          value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {loading && <p className="text-ink-soft">Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="space-y-3">
        {data?.items.length === 0 && <p className="card p-8 text-center text-ink-soft">No orders here.</p>}
        {data?.items.map((o) => {
          const action = NEXT_ACTION[o.status];
          const open = openId === o._id;
          return (
            <div key={o._id} className="card">
              <div className="p-3 flex flex-wrap items-center gap-3">
                <button onClick={() => setOpenId(open ? null : o._id)} className="font-bold hover:text-leaf-deep">{o.orderNo}</button>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColor[o.status]}`}>{o.status}</span>
                <span className="text-sm text-ink-soft">{new Date(o.createdAt).toLocaleString()}</span>
                <span className="text-sm">{o.customer.name} · <a href={`tel:${o.customer.phone}`} className="text-leaf-deep">{o.customer.phone}</a></span>
                <span className="ml-auto font-extrabold">{tk(o.total)}</span>
                {action && (
                  <button onClick={() => setOrderStatus(o._id, action[0])} className="btn-leaf py-1.5 px-4 text-sm">{action[1]}</button>
                )}
                {o.status !== 'cancelled' && o.status !== 'delivered' && (
                  <button onClick={() => confirm('Cancel this order and return the stock?') && setOrderStatus(o._id, 'cancelled')}
                    className="text-sm text-red-600 hover:underline">Cancel</button>
                )}
              </div>

              {open && (
                <div className="border-t border-line p-4 grid md:grid-cols-2 gap-4 text-sm bg-wash">
                  <div>
                    <h4 className="font-bold mb-1">Delivery</h4>
                    <p>{o.customer.name}<br />{o.customer.phone}{o.customer.email ? <><br />{o.customer.email}</> : null}</p>
                    <p className="mt-1">{o.customer.address}, {o.customer.city}</p>
                    {o.customer.note && <p className="mt-1 italic">Note: {o.customer.note}</p>}
                    <p className="mt-2">Payment: <b className="uppercase">{o.paymentMethod}</b> {o.paymentRef && `· ${o.paymentRef}`}</p>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Items</h4>
                    <ul className="space-y-1">
                      {o.items.map((l, i) => (
                        <li key={i} className="flex justify-between gap-3"><span>{l.name} × {l.qty}</span><span>{tk(l.price * l.qty)}</span></li>
                      ))}
                    </ul>
                    <div className="mt-2 pt-2 border-t border-line flex justify-between"><span>Subtotal</span><span>{tk(o.subtotal)}</span></div>
                    <div className="flex justify-between"><span>Delivery</span><span>{tk(o.shipping)}</span></div>
                    <div className="flex justify-between font-extrabold"><span>Total</span><span>{tk(o.total)}</span></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
