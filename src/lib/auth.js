import { cookies } from 'next/headers';
import { verifySession, COOKIE } from './session';

export { signSession, verifySession, cookieOptions, COOKIE } from './session';

/** Reads the session in a Server Component / Route Handler. */
export async function getSession() {
  return verifySession(cookies().get(COOKIE)?.value);
}

/** Throws 401 if the caller is not an admin. Use inside route handlers. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'owner')) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 });
  }
  return session;
}

/** True when an admin session exists — for endpoints that widen results for staff. */
export async function isAdmin() {
  const session = await getSession();
  return Boolean(session && (session.role === 'admin' || session.role === 'owner'));
}
