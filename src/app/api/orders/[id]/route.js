import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/auth';
import { handler, ok, fail } from '@/lib/api';
import { ORDER_STATUS } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const GET = handler(async (_req, { params }) => {
  await requireAdmin();
  await dbConnect();
  const order = await Order.findById(params.id).lean();
  if (!order) return fail('Order not found', 404);
  return ok(order);
});

/** PATCH { status } — accept, pack, ship, deliver or cancel an order. */
export const PATCH = handler(async (req, { params }) => {
  const admin = await requireAdmin();
  const { status } = await req.json();
  if (!ORDER_STATUS.includes(status)) return fail('Unknown status', 422);

  await dbConnect();
  const order = await Order.findById(params.id);
  if (!order) return fail('Order not found', 404);
  if (order.status === status) return ok(order);

  // Returning to stock happens exactly once, on the move into "cancelled".
  if (status === 'cancelled') {
    for (const l of order.items) {
      await Product.updateOne({ _id: l.product }, { $inc: { stock: l.qty } });
      // sold must never go negative if the product was reset in the meantime.
      await Product.updateOne({ _id: l.product, sold: { $gte: l.qty } }, { $inc: { sold: -l.qty } });
    }
  }
  // Un-cancelling takes the stock back out.
  if (order.status === 'cancelled' && status !== 'cancelled') {
    for (const l of order.items) {
      const res = await Product.updateOne({ _id: l.product, stock: { $gte: l.qty } }, { $inc: { stock: -l.qty, sold: l.qty } });
      if (res.modifiedCount !== 1) return fail(`Not enough stock of “${l.name}” to reopen this order`, 409);
    }
  }

  order.status = status;
  order.history.push({ status, by: admin.email });
  await order.save();
  return ok(order);
});

export const DELETE = handler(async (_req, { params }) => {
  await requireAdmin();
  await dbConnect();
  const d = await Order.findByIdAndDelete(params.id);
  if (!d) return fail('Order not found', 404);
  return ok({ deleted: true });
});
