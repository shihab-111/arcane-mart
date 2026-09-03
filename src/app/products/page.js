import Link from 'next/link';
import Shell from '@/components/Shell';
import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'All products' };

const sorts = [
  ['new', 'Newest'], ['popular', 'Popular'], ['price_asc', 'Price: low to high'], ['price_desc', 'Price: high to low'],
];

export default async function ProductsPage({ searchParams }) {
  const page = Number(searchParams.page || 1);
  const sort = searchParams.sort || 'new';
  const q = searchParams.q || '';
  const data = await getProducts({ q, sort, page, limit: 24 });

  const link = (p) => `/products?${new URLSearchParams({ ...(q && { q }), sort, page: String(p) })}`;

  return (
    <Shell>
      <div className="wrap py-6">
        <h1 className="heading mb-1">{q ? `Results for “${q}”` : 'All products'}</h1>
        <p className="text-sm text-ink-soft mb-4">{data.total} product{data.total === 1 ? '' : 's'}</p>

        <div className="flex gap-2 flex-wrap mb-5">
          {sorts.map(([v, label]) => (
            <Link key={v} href={`/products?${new URLSearchParams({ ...(q && { q }), sort: v })}`}
              className={`px-3 py-1.5 rounded-full text-sm border ${sort === v ? 'bg-leaf-deep text-white border-leaf-deep' : 'border-line hover:bg-leaf-soft'}`}>
              {label}
            </Link>
          ))}
        </div>

        {data.items.length === 0 ? (
          <p className="py-16 text-center text-ink-soft">Nothing here yet. Try another search or browse a category.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {data.items.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}

        {data.pages > 1 && (
          <div className="flex gap-2 justify-center mt-8">
            {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
              <Link key={p} href={link(p)} className={`w-9 h-9 grid place-items-center rounded-lg border ${p === data.page ? 'bg-leaf-deep text-white border-leaf-deep' : 'border-line hover:bg-leaf-soft'}`}>{p}</Link>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
