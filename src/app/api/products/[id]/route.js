import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { productUpdateSchema } from '@/lib/validate';
import { requireAdmin } from '@/lib/auth';
import { handler, ok, fail } from '@/lib/api';
import { slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';
const byIdOrSlug = (id) => (/^[a-f\d]{24}$/i.test(id) ? { _id: id } : { slug: id });

export const GET = handler(async (_req, { params }) => {
  await dbConnect();
  const product = await Product.findOne(byIdOrSlug(params.id)).populate('category', 'name slug').lean();
  if (!product) return fail('Product not found', 404);
  return ok(product);
});

export const PUT = handler(async (req, { params }) => {
  await requireAdmin();
  if (!/^[a-f\d]{24}$/i.test(params.id)) return fail('Product not found', 404);
  const body = productUpdateSchema.parse(await req.json());
  await dbConnect();

  const current = await Product.findById(params.id);
  if (!current) return fail('Product not found', 404);

  if (body.slug) {
    body.slug = slugify(body.slug);
    if (await Product.exists({ slug: body.slug, _id: { $ne: current._id } })) {
      body.slug = `${body.slug}-${Date.now().toString(36).slice(-4)}`;
    }
  }
  // Only clear the old price when it isn't actually a discount.
  const price = body.price ?? current.price;
  if (body.comparePrice != null && body.comparePrice <= price) body.comparePrice = null;

  Object.assign(current, body);
  await current.save();
  return ok(current);
});

export const DELETE = handler(async (_req, { params }) => {
  await requireAdmin();
  await dbConnect();
  const deleted = await Product.findByIdAndDelete(params.id);
  if (!deleted) return fail('Product not found', 404);
  return ok({ deleted: true });
});
