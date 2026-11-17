import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/session";

const protectedRoutes = ["/cart", "/orders", "/profile", "/invoice"];
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
    if (!(await verifySession(request.cookies.get("lbqueen_customer")?.value, "customer"))) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/cart/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/invoice/:path*",
    "/category/:path*",
    "/customer-portal/:path*",
  ],
};
