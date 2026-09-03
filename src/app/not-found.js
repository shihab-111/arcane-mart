import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] grid place-items-center text-center px-6">
      <div>
        <p className="text-5xl mb-3">🛍️</p>
        <h1 className="text-2xl font-extrabold">We couldn&apos;t find that page</h1>
        <p className="text-ink-soft mt-2">The link may be old, or the product was removed.</p>
        <Link href="/" className="btn-leaf mt-6">Back to shop</Link>
      </div>
    </div>
  );
}
