import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { trackSchema } from '@/lib/validate';
import { handler, ok, fail } from '@/lib/api';
import { rateLimit, clientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

/** Public tracking: order number + the phone used on the order. */
export const POST = handler(async (req) => {
  if (!rateLimit(`track:${clientIp(req)}`, { limit: 20, windowMs: 10 * 60 * 1000 }).allowed) {
    return fail('Too many lookups. Try again shortly.', 429);
  }
  const parsed = trackSchema.safeParse(await req.json());
  if (!parsed.success) return fail('Enter a valid order number and mobile number', 422);

  await dbConnect();
  const order = await Order.findOne({
    orderNo: parsed.data.orderNo.toUpperCase(),
    'customer.phone': parsed.data.phone,
  })
    .select('orderNo status items subtotal shipping total createdAt history customer.name')
    .lean();
  if (!order) return fail('No order matches that number and phone', 404);
  return ok(order);
});
