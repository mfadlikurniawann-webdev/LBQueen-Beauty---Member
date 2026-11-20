import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CUSTOMER_COOKIE, customerCookieOptions, readCustomerSession } from "@/lib/customer-session";

const protectedRoutes = ["/cart", "/orders", "/profile", "/membership", "/invoice"];
const categorySlugs = new Set(["promo", "layanan", "produk"]);
const legacyCategories: Record<string, string> = {
  "Treatment Care & Beauty": "layanan",
  "Product Care & Beauty": "produk",
};

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path === "/customer-portal" || path.startsWith("/customer-portal/")) {
    const url = request.nextUrl.clone();
    url.pathname = path.slice("/customer-portal".length) || "/";
    return NextResponse.redirect(url, 308);
  }

  if (path.startsWith("/category/")) {
    const type = decodeURIComponent(path.slice("/category/".length));
    if (legacyCategories[type]) {
      const url = request.nextUrl.clone();
      url.pathname = `/category/${legacyCategories[type]}`;
      return NextResponse.redirect(url, 308);
    }
    if (!categorySlugs.has(type))
      return NextResponse.rewrite(new URL("/kategori-tidak-ditemukan", request.url), {
        status: 404,
      });
  }

  if (protectedRoutes.some((route) => path === route || path.startsWith(`${route}/`))) {
    const cookie = request.cookies.get(CUSTOMER_COOKIE)?.value;
    const result = await readCustomerSession(cookie);
    if (!result) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      if (cookie) response.cookies.delete(CUSTOMER_COOKIE);
      return response;
    }
    if (result.renewed) {
      const response = NextResponse.next();
      response.cookies.set(
        CUSTOMER_COOKIE,
        result.renewed.value,
        customerCookieOptions(result.renewed.maxAge),
      );
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/cart/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/membership/:path*",
    "/invoice/:path*",
    "/category/:path*",
    "/customer-portal/:path*",
  ],
};
