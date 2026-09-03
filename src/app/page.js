import Link from 'next/link';
import Shell from '@/components/Shell';
import Slider from '@/components/Slider';
import ProductCard from '@/components/ProductCard';
import { getBanners, getCategories, getProducts, getSettings } from '@/lib/data';
import { tk } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [banners, categories, latest, best, settings] = await Promise.all([
    getBanners(),
    getCategories(),
    getProducts({ sort: 'new', limit: 8 }),
    getProducts({ sort: 'popular', limit: 8 }),
    getSettings(),
  ]);

  const promises = [
    { t: 'Free delivery', d: `On orders above ${tk(settings.freeShippingAbove ?? 1500)}` },
    { t: 'Authentic only', d: 'Sourced, checked, sealed' },
    { t: 'Fair prices', d: 'No hidden charges' },
    { t: '7-day returns', d: 'Wrong or damaged item' },
  ];

  return (
    <Shell>
      <section className="bg-wash py-5">
        <div className="wrap">
          {banners.length ? <Slider banners={banners} /> : (
            <div className="rounded-2xl bg-gradient-to-r from-leaf-deep to-leaf text-white p-8 md:p-12">
              <h1 className="text-2xl md:text-4xl font-extrabold max-w-[18ch]">Spices you can trace, gifts you can&apos;t find twice</h1>
              <p className="mt-2 max-w-[46ch] opacity-95">Daily necessities alongside authentic spices, anime figures and showpieces — packed and delivered from Dhaka.</p>
              <Link href="/products" className="btn-sun mt-5">Shop now</Link>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            {promises.map((p) => (
              <div key={p.t} className="card p-3">
                <b className="block text-sm">{p.t}</b>
                <span className="text-xs text-ink-soft">{p.d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap py-8">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="heading">Shop by category</h2>
          <Link href="/products" className="text-sm font-semibold text-leaf-deep hover:underline">See everything</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((c) => (
            <Link key={c._id} href={`/category/${c.slug}`}
              className="rounded-xl border border-line bg-wash hover:bg-leaf-soft hover:border-leaf p-4 text-center grid gap-1 justify-items-center">
              {c.image ? <img src={c.image} alt="" className="w-12 h-12 object-cover rounded-lg" /> : <span className="text-2xl">{c.emoji || '🛍️'}</span>}
              <b className="text-sm">{c.name}</b>
              <span className="text-xs text-ink-soft">{c.productCount} products</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="wrap py-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="heading">New arrivals</h2>
          <Link href="/products?sort=new" className="text-sm font-semibold text-leaf-deep hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {latest.items.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      <section className="wrap py-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="heading">Best selling</h2>
          <Link href="/products?sort=popular" className="text-sm font-semibold text-leaf-deep hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {best.items.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      <section className="wrap py-8">
        <div className="rounded-2xl bg-gradient-to-r from-leaf-deep to-leaf text-white p-8 text-center grid gap-2 justify-items-center">
          <h2 className="text-xl md:text-2xl font-extrabold">যে পণ্যটি খুঁজছেন পাচ্ছেন না? আমাদের জানান</h2>
          <p className="max-w-[52ch] opacity-95">Send a photo or a link on Facebook or WhatsApp. If it can be sourced, we quote a price and delivery date within 24 hours.</p>
        </div>
      </section>
    </Shell>
  );
}
