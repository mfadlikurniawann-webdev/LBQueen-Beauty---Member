import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/session';

const protectedRoutes = ['/cart', '/orders', '/profile', '/invoice'];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path === '/customer-portal' || path.startsWith('/customer-portal/')) {
    const url = request.nextUrl.clone();
    url.pathname = path.slice('/customer-portal'.length) || '/';
    return NextResponse.redirect(url, 308);
  }

  if (protectedRoutes.some(route => path === route || path.startsWith(`${route}/`))) {
    if (!await verifySession(request.cookies.get("lbqueen_customer")?.value, "customer")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};
