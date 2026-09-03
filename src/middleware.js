import { NextResponse } from 'next/server';
import { verifySession, COOKIE } from '@/lib/session';

/** Blocks the admin area at the edge — an unauthenticated request never reaches the page. */
export async function middleware(req) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const session = await verifySession(req.cookies.get(COOKIE)?.value);
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
