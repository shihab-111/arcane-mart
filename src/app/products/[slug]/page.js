import { notFound } from 'next/navigation';
import Link from 'next/link';
import Shell from '@/components/Shell';
import ProductCard from '@/components/ProductCard';
import Gallery from '@/components/Gallery';
import AddToCart from '@/components/AddToCart';
import { getProduct, getRelated } from '@/lib/data';
import { tk } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const p = await getProduct(params.slug);
  if (!p) return { title: 'Product not found' };
  return {
    title: p.name,
    description: p.description?.slice(0, 160) || p.name,
    openGraph: { images: p.images?.[0] ? [p.images[0]] : [] },
  };
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();
  const related = await getRelated(product);
  const off = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  return (
    <Shell>
      <div className="wrap py-6">
        <nav className="text-sm text-ink-soft mb-4">
          <Link href="/" className="hover:text-leaf-deep">Home</Link> ›{' '}
          {product.category && <><Link href={`/category/${product.category.slug}`} className="hover:text-leaf-deep">{product.category.name}</Link> › </>}
          <span>{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8">
          <Gallery images={product.images} name={product.name} />
          <div>
            <h1 className="text-2xl font-extrabold leading-tight">{product.name}</h1>
            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-3xl font-extrabold text-leaf-deep">{tk(product.price)}</span>
              {product.comparePrice ? <span className="text-ink-soft line-through">{tk(product.comparePrice)}</span> : null}
              {off > 0 && <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">Save {off}%</span>}
            </div>
            <p className="mt-2 text-sm">
              {product.stock > 0
                ? <span className="text-leaf-deep font-semibold">In stock · {product.stock} available</span>
                : <span className="text-red-600 font-semibold">Out of stock</span>}
            </p>

            <AddToCart product={product} />

            {product.description && (
              <div className="mt-6 whitespace-pre-line leading-relaxed text-[15px]">{product.description}</div>
            )}

            <ul className="mt-6 grid gap-2 text-sm text-ink-soft">
              <li>• Cash on delivery available all over Bangladesh</li>
              <li>• Inside Dhaka 1–2 days, outside Dhaka 2–4 days</li>
              <li>• 7-day return if the item arrives wrong or damaged</li>
            </ul>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="heading mb-4">You may also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {related.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </Shell>
  );
}
