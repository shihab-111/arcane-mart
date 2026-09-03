import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import Admin from '@/models/Admin';
import { loginSchema } from '@/lib/validate';
import { signSession, cookieOptions, COOKIE } from '@/lib/auth';
import { handler, ok, fail } from '@/lib/api';
import { rateLimit, clientIp } from '@/lib/rateLimit';

export const runtime = 'nodejs';
const MAX_AGE = 60 * 60 * 8; // 8 hours

export const POST = handler(async (req) => {
  const ip = clientIp(req);
  if (!rateLimit(`login:${ip}`, { limit: 8, windowMs: 10 * 60 * 1000 }).allowed) {
    return fail('Too many attempts. Try again in a few minutes.', 429);
  }

  const body = loginSchema.parse(await req.json());
  await dbConnect();

  const admin = await Admin.findOne({ email: body.email.toLowerCase() }).select('+passwordHash');
  // Constant-ish response: never reveal whether the email exists.
  if (!admin) return fail('Email or password is incorrect', 401);
  if (admin.lockedUntil && admin.lockedUntil > new Date()) {
    return fail('Account temporarily locked. Try again later.', 423);
  }

  const match = await bcrypt.compare(body.password, admin.passwordHash);
  if (!match) {
    admin.failedAttempts += 1;
    if (admin.failedAttempts >= 6) {
      admin.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      admin.failedAttempts = 0;
    }
    await admin.save();
    return fail('Email or password is incorrect', 401);
  }

  admin.failedAttempts = 0;
  admin.lockedUntil = undefined;
  admin.lastLoginAt = new Date();
  await admin.save();

  const token = await signSession({ sub: String(admin._id), email: admin.email, role: admin.role, name: admin.name }, MAX_AGE);
  const res = ok({ name: admin.name, email: admin.email, role: admin.role });
  res.cookies.set(COOKIE, token, cookieOptions(MAX_AGE));
  return res;
});
