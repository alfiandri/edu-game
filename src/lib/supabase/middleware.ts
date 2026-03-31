import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Skip auth if Supabase is not configured
  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    !supabaseUrl.startsWith("http")
  ) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public routes that don't require auth
  const publicRoutes = ["/", "/auth/login", "/auth/register"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If not authenticated and trying to access protected route
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // If authenticated and trying to access auth pages, redirect to dashboard
  if (user && (pathname === "/auth/login" || pathname === "/auth/register")) {
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

  return supabaseResponse;
}
