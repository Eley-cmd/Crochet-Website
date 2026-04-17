import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
export const runtime = 'nodejs';
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. IMMEDIATE BYPASS
  // If the path is /admin/login, don't even initialize Supabase. 
  // Just get out immediately.
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  // 2. INITIAL RESPONSE
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return response;

  // 3. CLIENT SETUP
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        // We update the request cookies so the subsequent getUser() call sees them
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        // We update the response so the browser gets the new cookies
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // 4. AUTH CHECK
  try {
    const { data: { user } } = await supabase.auth.getUser();

    // 5. REDIRECT LOGIC
    // Only redirect to login if we are trying to access /admin AND we aren't logged in.
    if (pathname.startsWith("/admin") && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  } catch (e) {
    console.error("Middleware Error:", e);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Exclude everything that isn't a "page" request.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};