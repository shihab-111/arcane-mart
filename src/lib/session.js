// Edge-safe session helpers: jose only, no next/headers import.
// Used by middleware (Edge runtime) and by lib/auth.js (Node runtime).
import { SignJWT, jwtVerify } from 'jose';

export const COOKIE = 'am_session';
const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'dev-only-insecure-secret');

export async function signSession(payload, maxAgeSeconds = 60 * 60 * 8) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('arcane-mart')
    .setExpirationTime(maxAgeSeconds + 's')
    .sign(getSecret());
}

export async function verifySession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { issuer: 'arcane-mart' });
    return payload;
  } catch {
    return null;
  }
}

export function cookieOptions(maxAge) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  };
}
