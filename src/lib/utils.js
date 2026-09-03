export const tk = (n) => '৳ ' + Number(n || 0).toLocaleString('en-BD');

export const slugify = (s) =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0980-\u09FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 90);

export const ORDER_STATUS = ['pending', 'accepted', 'packed', 'shipped', 'delivered', 'cancelled'];

export const statusColor = {
  pending: 'bg-amber-100 text-amber-800',
  accepted: 'bg-leaf-soft text-leaf-deep',
  packed: 'bg-sky-100 text-sky-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

/** Escapes user text before it goes into a MongoDB $regex, so "(" can't crash the query. */
export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Single source of truth for delivery cost — used by checkout UI and the order API. */
export function calcShipping(subtotal, city, settings = {}) {
  const free = settings.freeShippingAbove ?? 1500;
  if (subtotal >= free) return 0;
  return /dhaka/i.test(city || '')
    ? (settings.shippingInsideDhaka ?? 60)
    : (settings.shippingOutsideDhaka ?? 120);
}
