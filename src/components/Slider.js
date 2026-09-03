'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Slider({ banners = [] }) {
  const [i, setI] = useState(0);
  const n = banners.length;

  useEffect(() => {
    if (n < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 6000);
    return () => clearInterval(t);
  }, [n]);

  if (!n) return null;

  return (
    <div className="relative rounded-2xl overflow-hidden shadow">
      <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${i * 100}%)` }}>
        {banners.map((b) => (
          <Link key={b._id} href={b.link || '/products'} className="min-w-full relative">
            <img src={b.image} alt={b.title || 'Offer'} className="w-full object-cover" />
            {(b.title || b.subtitle) && (
              <div className="absolute inset-0 flex flex-col justify-center gap-2 p-6 md:p-10 bg-gradient-to-r from-ink/70 to-transparent text-white">
                <h2 className="text-xl md:text-4xl font-extrabold max-w-[16ch]">{b.title}</h2>
                <p className="max-w-[42ch] text-sm md:text-base opacity-95">{b.subtitle}</p>
              </div>
            )}
          </Link>
        ))}
      </div>
      {n > 1 && (
        <>
          <button onClick={() => setI((i - 1 + n) % n)} aria-label="Previous slide"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 text-leaf-deep">‹</button>
          <button onClick={() => setI((i + 1) % n)} aria-label="Next slide"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 text-leaf-deep">›</button>
          <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
            {banners.map((_, j) => (
              <button key={j} onClick={() => setI(j)} aria-label={`Slide ${j + 1}`}
                className={`h-2 rounded-full bg-white transition-all ${j === i ? 'w-6 opacity-100' : 'w-2 opacity-50'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
