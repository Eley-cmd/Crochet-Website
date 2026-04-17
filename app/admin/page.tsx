/**
 * app/admin/page.tsx
 * Admin dashboard homepage — summary stats and quick links.
 */
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLiveQuote } from "@/lib/quotes";

/** Fetch aggregate stats for the dashboard overview */
async function getStats() {
  const supabase = await createSupabaseServerClient();

  const [productsRes, ordersRes, pendingRes] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  return {
    products: productsRes.count ?? 0,
    orders: ordersRes.count ?? 0,
    pending: pendingRes.count ?? 0,
  };
}

export default async function AdminPage() {
  // Parallel fetch: Stats from Supabase and Quote from ZenQuotes
  const [stats, quote] = await Promise.all([
    getStats(),
    getLiveQuote()
  ]);

  const statCards = [
    {
      label: "Total Products",
      value: stats.products,
      href: "/admin/products",
      color: "bg-matcha",
      textColor: "text-cream",
    },
    {
      label: "Total Orders",
      value: stats.orders,
      href: "/admin/orders",
      color: "bg-latte",
      textColor: "text-matcha",
    },
    {
      label: "Pending Verification",
      value: stats.pending,
      href: "/admin/orders",
      color: "bg-bean",
      textColor: "text-white",
    },
  ];

  return (
    <div className="space-y-10 font-sans"> {/* Poppins base */}

      {/* 1. Header Section */}
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl text-matcha mb-2 tracking-tight">
          Dashboard
        </h1> {/* Libre Baskerville */}
        <p className="text-sesame-muted text-sm font-medium tracking-wide">
          Welcome back to Artrese Admin.
        </p>
      </div>

      {/* 2. Daily Motivation Section (24-Hour Refresh) */}
      <div className="bg-white border-l-4 border-matcha p-8 shadow-sm rounded-r-2xl overflow-hidden">
        <h4 className="font-sans text-[10px] uppercase tracking-[0.3em] text-matcha font-bold mb-4">
          Daily Inspiration
        </h4>
        <blockquote className="space-y-4">
          <p className="font-serif text-2xl italic text-sesame leading-relaxed">
            "{quote.text}"
          </p>
          <footer className="flex items-center gap-3">
            <div className="h-px w-8 bg-latte"></div>
            <cite className="font-sans text-[11px] font-semibold text-sesame-muted not-italic uppercase tracking-[0.2em]">
              {quote.author}
            </cite>
          </footer>
        </blockquote>
      </div>

      {/* 3. Stat cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`
              ${card.color} ${card.textColor}
              rounded-2xl p-6
              flex flex-col justify-between
              hover:scale-[1.02] transition-all duration-300
              min-h-[140px] shadow-sm group
            `}
          >
            <p className="text-4xl sm:text-5xl font-serif font-bold tracking-tighter">
              {card.value}
            </p> {/* Libre Baskerville */}
            <p className="font-sans text-[11px] font-bold uppercase tracking-widest mt-4 opacity-90">
              {card.label}
            </p> {/* Poppins */}
          </Link>
        ))}
      </div>

      {/* 4. Quick Actions */}
      <div className="bg-white border border-cream-dark rounded-2xl p-8 shadow-sm">
        <h2 className="font-serif text-xl text-matcha mb-6">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/products" className="btn-primary font-sans text-[11px] uppercase tracking-[0.2em] px-8 py-3 rounded-lg text-center">
            Manage Products
          </Link>
          <Link href="/admin/orders" className="btn-secondary font-sans text-[11px] uppercase tracking-[0.2em] px-8 py-3 rounded-lg text-center">
            View Orders
          </Link>
          <Link href="/" target="_blank" className="btn-secondary font-sans text-[11px] uppercase tracking-[0.2em] px-8 py-3 rounded-lg text-center border-dashed">
            View Storefront
          </Link>
        </div>
      </div>

    </div>
  );
}