/**
 * lib/supabase/client.ts
 * Browser-side Supabase client (for use inside Client Components).
 * Call createBrowserClient() once per component tree via a singleton pattern.
 */
import { createBrowserClient as _createBrowserClient } from "@supabase/ssr";

/**
 * Returns a Supabase client configured for use in the browser.
 * Safe to call multiple times — the underlying SDK de-duplicates connections.
 */
export function createBrowserClient() {
  return _createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
