'use client';
import Link from 'next/link';
import { useFetch } from './useApi';
import { tk, statusColor } from '@/lib/utils';

export default function Dashboard() {
  const { data, loading, error } = useFetch('/api/stats');
  if (loading) return <p className="text-ink-soft">Loading dashboard…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const cards = [
    { label: 'Orders waiting', value: data.pending, href: '/admin/orders?status=pending', accent: true },
    { label: 'Orders today', value: data.todayCount, href: '/admin/orders' },
    { label: 'Revenue (30 days)', value: tk(data.revenue30d), href: '/admin/orders' },
    { label: 'Low stock items', value: data.lowStock, href: '/admin/products' },
  ];

  return (
    <div>
      <h1 className="heading mb-5">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className={`card p-4 ${c.accent && data.pending > 0 ? 'ring-2 ring-leaf' : ''}`}>
            <div className="text-2xl font-extrabold text-leaf-deep">{c.value}</div>
            <div className="text-sm text-ink-soft">{c.label}</div>
          </Link>
        ))}
      </div>

      <h2 className="heading mt-8 mb-3">Latest orders</h2>
      <div className="card divide-y divide-line">
        {data.recent.length === 0 && <p className="p-6 text-center text-ink-soft">No orders yet.</p>}
        {data.recent.map((o) => (
          <Link key={o._id} href="/admin/orders" className="flex items-center gap-3 p-3 hover:bg-wash">
            <b className="text-sm">{o.orderNo}</b>
            <span className="text-sm text-ink-soft flex-1 truncate">{o.customer?.name}</span>
            <span className="text-sm font-bold">{tk(o.total)}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColor[o.status]}`}>{o.status}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
