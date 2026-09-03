import { COOKIE, cookieOptions } from '@/lib/auth';
import { handler, ok } from '@/lib/api';

export const POST = handler(async () => {
  const res = ok({ loggedOut: true });
  res.cookies.set(COOKIE, '', cookieOptions(0));
  return res;
});
