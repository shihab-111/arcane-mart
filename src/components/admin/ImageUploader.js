'use client';
import { useState } from 'react';

/** Uploads to /api/upload (Cloudinary if configured, otherwise local /public/uploads). */
export default function ImageUploader({ images = [], onChange, max = 6 }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function pick(e) {
    const files = [...e.target.files].slice(0, max - images.length);
    if (!files.length) return;
    setBusy(true); setError('');
    const next = [...images];
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.ok) next.push(json.data.url);
      else setError(json.error);
    }
    onChange(next);
    setBusy(false);
    e.target.value = '';
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {images.map((src) => (
          <div key={src} className="relative w-20 h-20">
            <img src={src} alt="" className="w-full h-full object-cover rounded-lg border border-line" />
            <button type="button" onClick={() => onChange(images.filter((i) => i !== src))}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white text-xs" aria-label="Remove image">✕</button>
          </div>
        ))}
        {images.length < max && (
          <label className="w-20 h-20 rounded-lg border-2 border-dashed border-line grid place-items-center cursor-pointer hover:border-leaf text-2xl text-ink-soft">
            +
            <input type="file" accept="image/*" multiple hidden onChange={pick} />
          </label>
        )}
      </div>
      {busy && <p className="text-sm text-ink-soft">Uploading…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-ink-soft">JPG, PNG or WebP · under 5 MB each · first image is the main photo</p>
    </div>
  );
}
