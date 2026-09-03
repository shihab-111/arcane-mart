import dbConnect from '@/lib/db';
import Banner from '@/models/Banner';
import { bannerSchema } from '@/lib/validate';
import { requireAdmin } from '@/lib/auth';
import { handler, ok } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const GET = handler(async (req) => {
  await dbConnect();
  const all = new URL(req.url).searchParams.get('all') === '1';
  const banners = await Banner.find(all ? {} : { active: true }).sort({ order: 1, createdAt: -1 }).lean();
  return ok(banners);
});

export const POST = handler(async (req) => {
  await requireAdmin();
  const body = bannerSchema.parse(await req.json());
  await dbConnect();
  return ok(await Banner.create(body), { status: 201 });
});
