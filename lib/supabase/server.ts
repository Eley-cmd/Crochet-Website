/**
 * lib/supabase/server.ts
 * Server-side Supabase client for use in:
 *   - Next.js Server Components
 *   - Route Handlers (app/api/*)
 *   - Server Actions
 *
 * Uses cookie-based session management via @supabase/ssr.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client that reads/writes cookies for session persistence.
 * Must be called inside an async Server Component or Route Handler.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

/**
 * Creates a Supabase client using the SERVICE_ROLE key.
 * IMPORTANT: Use ONLY in server-side admin operations (Route Handlers).
 * NEVER expose this client to the browser — it bypasses all RLS policies.
 */
export function createSupabaseAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    }
  );
}
