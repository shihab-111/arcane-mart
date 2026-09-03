import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';
import { settingsSchema } from '@/lib/validate';
import { requireAdmin } from '@/lib/auth';
import { handler, ok } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const GET = handler(async () => {
  await dbConnect();
  let s = await Settings.findOne({ key: 'site' }).lean();
  if (!s) s = (await Settings.create({ key: 'site' })).toObject();
  return ok(s);
});

export const PUT = handler(async (req) => {
  await requireAdmin();
  const body = settingsSchema.parse(await req.json());
  await dbConnect();
  const s = await Settings.findOneAndUpdate({ key: 'site' }, body, { new: true, upsert: true, runValidators: true });
  return ok(s);
});
