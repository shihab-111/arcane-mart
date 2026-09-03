import Shell from '@/components/Shell';
import ProductCard from '@/components/ProductCard';
import { getProducts, getCategories } from '@/lib/data';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const cats = await getCategories();
  const cat = cats.find((c) => c.slug === params.slug);
  return { title: cat ? cat.name : 'Category' };
}

export default async function CategoryPage({ params, searchParams }) {
  const cats = await getCategories();
  const cat = cats.find((c) => c.slug === params.slug);
  if (!cat) notFound();
  const data = await getProducts({ category: params.slug, sort: searchParams.sort || 'new', limit: 24 });

  return (
    <Shell>
      <div className="wrap py-6">
        <h1 className="heading mb-1">{cat.emoji} {cat.name}</h1>
        <p className="text-sm text-ink-soft mb-5">{data.total} product{data.total === 1 ? '' : 's'}</p>
        {data.items.length === 0 ? (
          <p className="py-16 text-center text-ink-soft">No products in this category yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {data.items.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </Shell>
  );
}
