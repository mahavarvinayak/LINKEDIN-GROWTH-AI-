import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Admin route protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const ADMIN_EMAIL = 'vinayakmahavar45@gmail.com';

    if (!user || user.email !== ADMIN_EMAIL) {
      // Silent redirect to home — don't reveal admin page exists
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  const url = request.nextUrl.clone();
  const isProtectedRoute = url.pathname.startsWith("/dashboard") || url.pathname === "/onboarding";

  // 1. Protected Routes
  if (isProtectedRoute) {
    if (!user) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // 2. Prevent logged in users from visiting auth pages
  if ((url.pathname === "/login" || url.pathname === "/signup") && user) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/signup",
    "/onboarding",
    "/admin/:path*",
  ],
};
