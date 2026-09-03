import { getProducts, getCategories } from '@/lib/data';

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://arcanemart.com';
  let items = [], cats = [];
  try {
    [{ items }, cats] = await Promise.all([getProducts({ limit: 48 }), getCategories()]);
  } catch {
    // DB unavailable at build time — ship the static routes only.
  }
  return [
    { url: base, priority: 1 },
    { url: `${base}/products`, priority: 0.9 },
    ...cats.map((c) => ({ url: `${base}/category/${c.slug}`, priority: 0.8 })),
    ...items.map((p) => ({ url: `${base}/products/${p.slug}`, lastModified: p.updatedAt, priority: 0.7 })),
  ];
}
