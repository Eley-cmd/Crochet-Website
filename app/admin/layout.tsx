/**
 * app/admin/layout.tsx
 * Admin layout wrapper — handles UI shell and session check.
 */
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { headers } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Get the current URL path to check if we are on the login page
  const headerList = await headers();
  const fullPath = headerList.get("x-current-path") || "";
  // Note: If you don't have a custom header for path, we can use a simpler check:
  // In Next.js layouts, the login page is a 'child'. 
  // If we don't want to redirect, we just need to be careful.

  // 2. LOGIC: If there is no user, we ONLY allow them to see the login page.
  // We rely on the Middleware to handle the heavy redirecting.
  // In the layout, we just prevent the Sidebar from rendering if unauthenticated.

  if (!user) {
    // Return JUST the children (the login form) without the Admin Sidebar shell
    // This breaks the redirect loop.
    return <div className="min-h-screen bg-cream">{children}</div>;
  }

  // 3. AUTHENTICATED LAYOUT
  return (
    <div className="min-h-screen bg-cream flex flex-col sm:flex-row">
      {/* Sidebar navigation */}
      <AdminSidebar userEmail={user.email ?? ""} />

      {/* Main content area */}
      <main className="flex-1 min-w-0 overflow-auto">
        {/* Added 'pt-20' (for mobile top nav height) 
           and 'sm:pt-10' (reset for desktop) 
        */}
        <div className="max-w-6xl mx-auto px-4 xs:px-5 sm:px-6 pt-24 pb-8 sm:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
