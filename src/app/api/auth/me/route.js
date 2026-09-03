import { getSession } from '@/lib/auth';
import { handler, ok, fail } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const GET = handler(async () => {
  const s = await getSession();
  if (!s) return fail('Unauthorized', 401);
  return ok({ name: s.name, email: s.email, role: s.role });
});
