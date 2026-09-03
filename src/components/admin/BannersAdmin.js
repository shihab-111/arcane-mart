'use client';
import { useState } from 'react';
import { useFetch, api } from './useApi';
import ImageUploader from './ImageUploader';

const EMPTY = { title: '', subtitle: '', image: '', link: '/products', order: 0, active: true };

export default function BannersAdmin() {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const { data, loading, reload } = useFetch('/api/banners?all=1');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function save(e) {
    e.preventDefault(); setError('');
    if (!form.image) return setError('Upload a banner image first');
    try {
      const payload = { title: form.title, subtitle: form.subtitle, image: form.image, link: form.link, order: Number(form.order), active: form.active };
      if (form._id) await api(`/api/banners/${form._id}`, { method: 'PUT', body: JSON.stringify(payload) });
      else await api('/api/banners', { method: 'POST', body: JSON.stringify(payload) });
      setForm(EMPTY); reload();
    } catch (err) { setError(err.message); }
  }

  async function remove(id) {
    if (!confirm('Delete this banner?')) return;
    await api(`/api/banners/${id}`, { method: 'DELETE' });
    reload();
  }

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <div>
        <h1 className="heading mb-4">Home banners</h1>
        <p className="text-sm text-ink-soft mb-3">Best size: 1600 × 600 px. They rotate automatically on the home page.</p>
        {loading && <p className="text-ink-soft">Loading…</p>}
        <div className="grid gap-3">
          {data?.length === 0 && <p className="card p-8 text-center text-ink-soft">No banners yet.</p>}
          {data?.map((b) => (
            <div key={b._id} className="card overflow-hidden">
              <img src={b.image} alt="" className="w-full max-h-40 object-cover" />
              <div className="p-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="font-semibold">{b.title || '(no title)'}</div>
                  <div className="text-xs text-ink-soft">→ {b.link}{!b.active && ' · hidden'}</div>
                </div>
                <button onClick={() => setForm({ ...b })} className="btn-ghost py-1.5 px-3 text-sm">Edit</button>
                <button onClick={() => remove(b._id)} className="text-red-600 text-sm hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={save} className="card p-5 h-fit grid gap-3">
        <h2 className="font-bold">{form._id ? 'Edit banner' : 'Add banner'}</h2>
        <div><label className="label">Image</label>
          <ImageUploader max={1} images={form.image ? [form.image] : []} onChange={(imgs) => setForm({ ...form, image: imgs[0] || '' })} />
        </div>
        <div><label className="label">Headline (optional)</label><input className="field" value={form.title} onChange={set('title')} /></div>
        <div><label className="label">Sub-line (optional)</label><input className="field" value={form.subtitle} onChange={set('subtitle')} /></div>
        <div><label className="label">Links to</label><input className="field" value={form.link} onChange={set('link')} placeholder="/category/spices" /></div>
        <div><label className="label">Sort order</label><input type="number" className="field" value={form.order} onChange={set('order')} /></div>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={set('active')} /> Show on home page</label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button className="btn-leaf flex-1">{form._id ? 'Save changes' : 'Add banner'}</button>
          {form._id && <button type="button" onClick={() => setForm(EMPTY)} className="btn-ghost">Cancel</button>}
        </div>
      </form>
    </div>
  );
}
