"use client";
/**
 * components/admin/AdminSidebar.tsx
 * Responsive sidebar for the admin dashboard.
 * On mobile: collapses to a top nav bar with a hamburger toggle.
 * On desktop: fixed left sidebar.
 */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

interface AdminSidebarProps {
  userEmail: string;
}

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
      </svg>
    ),
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
      </svg>
    ),
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
      </svg>
    ),
  },
];

export default function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-cream-dark">
        <Link href="/" className="font-serif text-xl text-matcha font-bold">
          Artrese&apos;
        </Link>
        <p className="text-xs text-sesame-muted mt-0.5">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? "bg-matcha text-cream"
                  : "text-sesame hover:bg-cream-dark hover:text-matcha"
                }
              `}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + sign out */}
      <div className="px-3 py-4 border-t border-cream-dark">
        <p className="text-xs text-sesame-muted truncate px-3 mb-2">{userEmail}</p>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium
            text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
          </svg>
          {signingOut ? "Signing out..." : "Sign Out"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 xl:w-64 shrink-0 bg-white border-r border-cream-dark min-h-screen sticky top-0 h-screen overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-cream-dark">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="font-serif text-lg text-matcha font-bold">
            Artrese&apos;
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-md text-sesame hover:bg-cream-dark transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile dropdown nav */}
        {mobileOpen && (
          <div className="bg-white border-t border-cream-dark shadow-card-hover">
            {sidebarContent}
          </div>
        )}
      </div>

      {/* Spacer for mobile fixed bar */}
      <div className="lg:hidden h-14" />
    </>
  );
}
