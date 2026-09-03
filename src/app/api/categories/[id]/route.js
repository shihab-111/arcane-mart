import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { categoryUpdateSchema } from '@/lib/validate';
import { requireAdmin } from '@/lib/auth';
import { handler, ok, fail } from '@/lib/api';
import { slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const PUT = handler(async (req, { params }) => {
  await requireAdmin();
  const body = categoryUpdateSchema.parse(await req.json());
  if (body.slug) body.slug = slugify(body.slug);
  await dbConnect();
  const cat = await Category.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
  if (!cat) return fail('Category not found', 404);
  return ok(cat);
});

export const DELETE = handler(async (_req, { params }) => {
  await requireAdmin();
  await dbConnect();
  const inUse = await Product.countDocuments({ category: params.id });
  if (inUse) return fail(`Move or delete the ${inUse} product(s) in this category first`, 409);
  const deleted = await Category.findByIdAndDelete(params.id);
  if (!deleted) return fail('Category not found', 404);
  return ok({ deleted: true });
});
