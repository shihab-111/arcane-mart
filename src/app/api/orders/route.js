import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Settings from '@/models/Settings';
import { orderSchema } from '@/lib/validate';
import { requireAdmin } from '@/lib/auth';
import { handler, ok, fail } from '@/lib/api';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import { escapeRegex, calcShipping } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/** GET /api/orders?status=&q=&page= (admin) */
export const GET = handler(async (req) => {
  await requireAdmin();
  await dbConnect();
  const sp = new URL(req.url).searchParams;
  const page = Math.max(1, Number(sp.get('page') || 1));
  const limit = 20;
  const filter = {};
  if (sp.get('status') && sp.get('status') !== 'all') filter.status = sp.get('status');
  if (sp.get('q')) {
    const q = escapeRegex(sp.get('q').slice(0, 40));
    filter.$or = [
      { orderNo: { $regex: q, $options: 'i' } },
      { 'customer.phone': { $regex: q, $options: 'i' } },
      { 'customer.name': { $regex: q, $options: 'i' } },
    ];
  }
  const [items, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);
  return ok({ items, total, page, pages: Math.ceil(total / limit) });
});

/**
 * POST /api/orders (public checkout)
 * Prices and shipping are recalculated from the database — the client's numbers are ignored.
 * Stock is decremented conditionally, so the last unit cannot be sold twice.
 */
export const POST = handler(async (req) => {
  const ip = clientIp(req);
  if (!rateLimit(`order:${ip}`, { limit: 10, windowMs: 10 * 60 * 1000 }).allowed) {
    return fail('Too many orders from this connection. Please contact us directly.', 429);
  }

  const body = orderSchema.parse(await req.json());
  await dbConnect();

  // Merge duplicate lines for the same product before checking stock.
  const wanted = new Map();
  for (const l of body.items) wanted.set(l.product, (wanted.get(l.product) || 0) + l.qty);

  const products = await Product.find({ _id: { $in: [...wanted.keys()], }, active: true }).lean();
  if (products.length !== wanted.size) return fail('One or more products are no longer available', 409);

  const lines = [];
  for (const p of products) {
    const qty = wanted.get(String(p._id));
    if (p.stock < qty) return fail(`Only ${p.stock} left of “${p.name}”. Please adjust your cart.`, 409);
    lines.push({ product: p._id, name: p.name, image: p.images?.[0] || '', price: p.price, qty });
  }

  const settings = (await Settings.findOne({ key: 'site' }).lean()) || {};
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const shipping = calcShipping(subtotal, body.customer.city, settings);

  const doc = {
    customer: body.customer,
    items: lines,
    subtotal,
    shipping,
    total: subtotal + shipping,
    paymentMethod: body.paymentMethod,
    paymentRef: body.paymentRef,
    status: 'pending',
    history: [{ status: 'pending', by: 'customer' }],
  };

  let order;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      for (const l of lines) {
        const res = await Product.updateOne(
          { _id: l.product, stock: { $gte: l.qty } },
          { $inc: { stock: -l.qty, sold: l.qty } },
          { session }
        );
        if (res.modifiedCount !== 1) throw Object.assign(new Error('oversold'), { oversold: l.name });
      }
      order = (await Order.create([doc], { session }))[0];
    });
  } catch (err) {
    if (err?.oversold) return fail(`“${err.oversold}” just sold out. Please adjust your cart.`, 409);
    // Standalone MongoDB (no replica set) can't run transactions — degrade gracefully.
    const noTxn = /Transaction numbers|replica set|Illegal state transition/i.test(String(err?.message));
    if (!noTxn) throw err;
    for (const l of lines) {
      const res = await Product.updateOne({ _id: l.product, stock: { $gte: l.qty } }, { $inc: { stock: -l.qty, sold: l.qty } });
      if (res.modifiedCount !== 1) return fail(`“${l.name}” just sold out. Please adjust your cart.`, 409);
    }
    order = await Order.create(doc);
  } finally {
    await session.endSession();
  }

  return ok({ orderNo: order.orderNo, id: String(order._id), total: order.total }, { status: 201 });
});
