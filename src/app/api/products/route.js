import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { productSchema } from '@/lib/validate';
import { requireAdmin, isAdmin } from '@/lib/auth';
import { handler, ok } from '@/lib/api';
import { slugify, escapeRegex } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/** GET /api/products?category=slug&q=&featured=1&page=1&sort=new|price_asc|price_desc|popular */
export const GET = handler(async (req) => {
  await dbConnect();
  const sp = new URL(req.url).searchParams;
  const page = Math.max(1, Number(sp.get('page') || 1));
  const limit = Math.min(48, Math.max(1, Number(sp.get('limit') || 24)));
  const filter = { active: true };

  // Hidden products are only listed for a signed-in admin.
  if (sp.get('all') === '1' && (await isAdmin())) delete filter.active;

  if (sp.get('categoryId')) filter.category = sp.get('categoryId');
  else if (sp.get('category')) {
    const cat = await Category.findOne({ slug: sp.get('category') }).lean();
    if (!cat) return ok({ items: [], total: 0, page, pages: 0 });
    filter.category = cat._id;
  }
  if (sp.get('featured') === '1') filter.featured = true;
  if (sp.get('q')) filter.name = { $regex: escapeRegex(sp.get('q').slice(0, 60)), $options: 'i' };

  const sortMap = {
    new: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    popular: { sold: -1 },
  };
  const sort = sortMap[sp.get('sort')] || sortMap.new;

  const [items, total] = await Promise.all([
    Product.find(filter).populate('category', 'name slug').sort(sort).skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  return ok({ items, total, page, pages: Math.ceil(total / limit) });
});

/** POST /api/products (admin) */
export const POST = handler(async (req) => {
  await requireAdmin();
  const body = productSchema.parse(await req.json());
  await dbConnect();

  let slug = slugify(body.slug || body.name);
  if (!slug) slug = 'product';
  if (await Product.exists({ slug })) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  if (body.comparePrice && body.comparePrice <= body.price) body.comparePrice = null;
  const product = await Product.create({ ...body, slug });
  return ok(product, { status: 201 });
});
