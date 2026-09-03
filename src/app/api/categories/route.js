import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { categorySchema } from '@/lib/validate';
import { requireAdmin } from '@/lib/auth';
import { handler, ok } from '@/lib/api';
import { slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const GET = handler(async (req) => {
  await dbConnect();
  const all = new URL(req.url).searchParams.get('all') === '1';
  const cats = await Category.find(all ? {} : { active: true }).sort({ order: 1, name: 1 }).lean();
  const counts = await Product.aggregate([
    { $match: { active: true } },
    { $group: { _id: '$category', n: { $sum: 1 } } },
  ]);
  const map = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
  return ok(cats.map((c) => ({ ...c, productCount: map[String(c._id)] || 0 })));
});

export const POST = handler(async (req) => {
  await requireAdmin();
  const body = categorySchema.parse(await req.json());
  await dbConnect();
  let slug = slugify(body.slug || body.name);
  if (await Category.exists({ slug })) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  const cat = await Category.create({ ...body, slug });
  return ok(cat, { status: 201 });
});
