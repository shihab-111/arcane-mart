'use client';
import { useState } from 'react';

export default function Gallery({ images = [], name }) {
  const [i, setI] = useState(0);
  if (!images.length) return <div className="aspect-square rounded-xl bg-wash grid place-items-center text-6xl">🛍️</div>;
  return (
    <div>
      <div className="aspect-square rounded-xl overflow-hidden bg-wash border border-line">
        <img src={images[i]} alt={name} className="w-full h-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-auto">
          {images.map((src, j) => (
            <button key={src} onClick={() => setI(j)} aria-label={`Image ${j + 1}`}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${j === i ? 'border-leaf' : 'border-line'}`}>
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
