'use client';
import { useState } from 'react';
import { useFetch, api } from './useApi';
import ImageUploader from './ImageUploader';

const EMPTY = { name: '', emoji: '', image: '', order: 0, active: true };

export default function CategoriesAdmin() {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const { data, loading, reload } = useFetch('/api/categories?all=1');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function save(e) {
    e.preventDefault(); setError('');
    try {
      const payload = { name: form.name, emoji: form.emoji, image: form.image, order: Number(form.order), active: form.active };
      if (form._id) await api(`/api/categories/${form._id}`, { method: 'PUT', body: JSON.stringify(payload) });
      else await api('/api/categories', { method: 'POST', body: JSON.stringify(payload) });
      setForm(EMPTY); reload();
    } catch (err) { setError(err.message); }
  }

  async function remove(id) {
    if (!confirm('Delete this category?')) return;
    try { await api(`/api/categories/${id}`, { method: 'DELETE' }); reload(); }
    catch (err) { alert(err.message); }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <div>
        <h1 className="heading mb-4">Categories</h1>
        {loading && <p className="text-ink-soft">Loading…</p>}
        <div className="card divide-y divide-line">
          {data?.length === 0 && <p className="p-8 text-center text-ink-soft">No categories yet.</p>}
          {data?.map((c) => (
            <div key={c._id} className="flex items-center gap-3 p-3">
              {c.image ? <img src={c.image} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <span className="text-2xl w-10 text-center">{c.emoji || '🛍️'}</span>}
              <div className="flex-1">
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-ink-soft">/{c.slug} · {c.productCount} products{!c.active && ' · hidden'}</div>
              </div>
              <button onClick={() => setForm({ ...c })} className="btn-ghost py-1.5 px-3 text-sm">Edit</button>
              <button onClick={() => remove(c._id)} className="text-red-600 text-sm hover:underline">Delete</button>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={save} className="card p-5 h-fit grid gap-3">
        <h2 className="font-bold">{form._id ? 'Edit category' : 'Add category'}</h2>
        <div><label className="label">Name</label><input required className="field" value={form.name} onChange={set('name')} /></div>
        <div><label className="label">Emoji (used if no image)</label><input className="field" maxLength={4} value={form.emoji} onChange={set('emoji')} placeholder="🌶️" /></div>
        <div><label className="label">Image (optional)</label>
          <ImageUploader max={1} images={form.image ? [form.image] : []} onChange={(imgs) => setForm({ ...form, image: imgs[0] || '' })} />
        </div>
        <div><label className="label">Sort order</label><input type="number" className="field" value={form.order} onChange={set('order')} /></div>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={set('active')} /> Show in shop</label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button className="btn-leaf flex-1">{form._id ? 'Save changes' : 'Add category'}</button>
          {form._id && <button type="button" onClick={() => setForm(EMPTY)} className="btn-ghost">Cancel</button>}
        </div>
      </form>
    </div>
  );
}
