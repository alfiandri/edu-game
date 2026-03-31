import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifySession } from "@/lib/auth/session";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;
  const pathname = request.nextUrl.pathname;

  // Public routes that don't require auth
  const publicRoutes = ["/", "/auth/login", "/auth/register"];
  const isPublicRoute = publicRoutes.includes(pathname);
  const isApiAuth = pathname.startsWith("/api/auth/");

  // Allow API auth routes always
  if (isApiAuth) {
    return NextResponse.next();
  }

  // If not authenticated and trying to access protected route
  if (!session && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // If authenticated and trying to access auth pages, redirect to dashboard
  if (session && (pathname === "/auth/login" || pathname === "/auth/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/parent/dashboard";
    return NextResponse.redirect(url);
  }

  // Play routes require a selected child (stored in cookie)
  if (pathname.startsWith("/play") && pathname !== "/play/select-child") {
    const selectedChild = request.cookies.get("selected_child_id")?.value;
    if (!selectedChild) {
      const url = request.nextUrl.clone();
      url.pathname = "/play/select-child";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
