'use client';
import { useEffect, useState } from 'react';
import { useFetch, api } from './useApi';
import ImageUploader from './ImageUploader';

export default function SettingsAdmin() {
  const { data } = useFetch('/api/settings');
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { if (data) setForm(data); }, [data]);
  if (!form) return <p className="text-ink-soft">Loading…</p>;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function save(e) {
    e.preventDefault(); setMsg(''); setError('');
    try {
      const { _id, key, createdAt, updatedAt, __v, ...payload } = form;
      payload.freeShippingAbove = Number(payload.freeShippingAbove);
      payload.shippingInsideDhaka = Number(payload.shippingInsideDhaka);
      payload.shippingOutsideDhaka = Number(payload.shippingOutsideDhaka);
      await api('/api/settings', { method: 'PUT', body: JSON.stringify(payload) });
      setMsg('Settings saved');
    } catch (err) { setError(err.message); }
  }

  return (
    <form onSubmit={save} className="max-w-2xl">
      <h1 className="heading mb-4">Store settings</h1>
      <div className="card p-5 grid gap-4">
        <div><label className="label">Shop logo</label>
          <ImageUploader max={1} images={form.logo ? [form.logo] : []} onChange={(imgs) => setForm({ ...form, logo: imgs[0] || '' })} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">Shop name</label><input className="field" value={form.siteName || ''} onChange={set('siteName')} /></div>
          <div><label className="label">Phone</label><input className="field" value={form.phone || ''} onChange={set('phone')} /></div>
          <div><label className="label">Email</label><input className="field" value={form.email || ''} onChange={set('email')} /></div>
          <div><label className="label">Address</label><input className="field" value={form.address || ''} onChange={set('address')} /></div>
          <div><label className="label">Facebook URL</label><input className="field" value={form.facebook || ''} onChange={set('facebook')} /></div>
          <div><label className="label">Instagram URL</label><input className="field" value={form.instagram || ''} onChange={set('instagram')} /></div>
          <div><label className="label">WhatsApp link</label><input className="field" value={form.whatsapp || ''} onChange={set('whatsapp')} /></div>
        </div>
        <div><label className="label">Top announcement bar</label><input className="field" value={form.announcement || ''} onChange={set('announcement')} /></div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div><label className="label">Free shipping above (৳)</label><input type="number" className="field" value={form.freeShippingAbove} onChange={set('freeShippingAbove')} /></div>
          <div><label className="label">Delivery inside Dhaka (৳)</label><input type="number" className="field" value={form.shippingInsideDhaka} onChange={set('shippingInsideDhaka')} /></div>
          <div><label className="label">Delivery outside Dhaka (৳)</label><input type="number" className="field" value={form.shippingOutsideDhaka} onChange={set('shippingOutsideDhaka')} /></div>
        </div>
        {msg && <p className="text-leaf-deep text-sm font-semibold">{msg}</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="btn-leaf justify-self-start">Save settings</button>
      </div>
    </form>
  );
}
