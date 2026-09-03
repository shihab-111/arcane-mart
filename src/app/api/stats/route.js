import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/auth';
import { handler, ok } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const GET = handler(async () => {
  await requireAdmin();
  await dbConnect();
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);

  const [pending, todayCount, revenueAgg, lowStock, recent, byStatus] = await Promise.all([
    Order.countDocuments({ status: 'pending' }),
    Order.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
    Order.aggregate([
      { $match: { status: { $in: ['accepted', 'packed', 'shipped', 'delivered'] }, createdAt: { $gte: since } } },
      { $group: { _id: null, total: { $sum: '$total' }, n: { $sum: 1 } } },
    ]),
    Product.countDocuments({ active: true, stock: { $lte: 3 } }),
    Order.find().sort({ createdAt: -1 }).limit(8).select('orderNo customer.name total status createdAt').lean(),
    Order.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
  ]);

  return ok({
    pending,
    todayCount,
    revenue30d: revenueAgg[0]?.total || 0,
    orders30d: revenueAgg[0]?.n || 0,
    lowStock,
    recent,
    byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.n])),
  });
});
