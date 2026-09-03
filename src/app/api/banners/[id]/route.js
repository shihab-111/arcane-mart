import dbConnect from '@/lib/db';
import Banner from '@/models/Banner';
import { bannerUpdateSchema } from '@/lib/validate';
import { requireAdmin } from '@/lib/auth';
import { handler, ok, fail } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const PUT = handler(async (req, { params }) => {
  await requireAdmin();
  const body = bannerUpdateSchema.parse(await req.json());
  await dbConnect();
  const b = await Banner.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
  if (!b) return fail('Banner not found', 404);
  return ok(b);
});

export const DELETE = handler(async (_req, { params }) => {
  await requireAdmin();
  await dbConnect();
  const d = await Banner.findByIdAndDelete(params.id);
  if (!d) return fail('Banner not found', 404);
  return ok({ deleted: true });
});
