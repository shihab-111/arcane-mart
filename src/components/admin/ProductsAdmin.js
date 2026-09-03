'use client';
import { useState } from 'react';
import { useFetch, api } from './useApi';
import ImageUploader from './ImageUploader';
import { tk } from '@/lib/utils';

const EMPTY = { name: '', description: '', price: '', comparePrice: '', stock: 0, category: '', images: [], featured: false, active: true };

export default function ProductsAdmin() {
  const [q, setQ] = useState('');
  const [form, setForm] = useState(null); // null = list, object = editor
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const products = useFetch(`/api/products?all=1&limit=48&q=${encodeURIComponent(q)}`, [q]);
  const cats = useFetch('/api/categories?all=1');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function save(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
        stock: Number(form.stock),
      };
      delete payload._id; delete payload.createdAt; delete payload.updatedAt; delete payload.sold; delete payload.__v; delete payload.slug;
      if (typeof payload.category === 'object') payload.category = payload.category._id;
      if (form._id) await api(`/api/products/${form._id}`, { method: 'PUT', body: JSON.stringify(payload) });
      else await api('/api/products', { method: 'POST', body: JSON.stringify(payload) });
      setForm(null);
      products.reload();
    } catch (err) { setError(err.message); }
    setBusy(false);
  }

  async function remove(id) {
    if (!confirm('Delete this product permanently?')) return;
    await api(`/api/products/${id}`, { method: 'DELETE' });
    products.reload();
  }

  if (form) {
    return (
      <form onSubmit={save} className="max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="heading">{form._id ? 'Edit product' : 'New product'}</h1>
          <button type="button" onClick={() => setForm(null)} className="btn-ghost py-1.5">Back to list</button>
        </div>

        <div className="card p-5 grid gap-4">
          <div><label className="label">Product name</label><input required className="field" value={form.name} onChange={set('name')} /></div>

          <div><label className="label">Photos</label>
            <ImageUploader images={form.images} onChange={(images) => setForm({ ...form, images })} />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div><label className="label">Price (৳)</label><input required type="number" min="0" className="field" value={form.price} onChange={set('price')} /></div>
            <div><label className="label">Old price (optional)</label><input type="number" min="0" className="field" value={form.comparePrice ?? ''} onChange={set('comparePrice')} /></div>
            <div><label className="label">Stock</label><input required type="number" min="0" className="field" value={form.stock} onChange={set('stock')} /></div>
          </div>

          <div><label className="label">Category</label>
            <select required className="field" value={typeof form.category === 'object' ? form.category?._id : form.category} onChange={set('category')}>
              <option value="">Choose a category…</option>
              {cats.data?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div><label className="label">Description</label><textarea rows={6} className="field" value={form.description} onChange={set('description')} /></div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={set('featured')} /> Featured on home</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={set('active')} /> Visible in shop</label>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button disabled={busy} className="btn-leaf disabled:opacity-60">{busy ? 'Saving…' : 'Save product'}</button>
            <button type="button" onClick={() => setForm(null)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h1 className="heading">Products</h1>
        <input className="field max-w-xs ml-auto" placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
        <button onClick={() => setForm({ ...EMPTY })} className="btn-leaf py-2">Add product</button>
      </div>

      {products.loading && <p className="text-ink-soft">Loading…</p>}
      <div className="card divide-y divide-line">
        {products.data?.items.length === 0 && <p className="p-8 text-center text-ink-soft">No products yet. Add your first one.</p>}
        {products.data?.items.map((p) => (
          <div key={p._id} className="flex items-center gap-3 p-3">
            <img src={p.images?.[0] || ''} alt="" className="w-12 h-12 rounded-lg object-cover bg-wash" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{p.name}</div>
              <div className="text-xs text-ink-soft">{p.category?.name} · stock {p.stock} · sold {p.sold || 0}{!p.active && ' · hidden'}</div>
            </div>
            <div className="font-bold">{tk(p.price)}</div>
            <button onClick={() => setForm({ ...p })} className="btn-ghost py-1.5 px-3 text-sm">Edit</button>
            <button onClick={() => remove(p._id)} className="text-red-600 text-sm hover:underline">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
