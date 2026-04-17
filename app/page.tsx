/**
 * app/page.tsx
 * Public homepage — hero section + product catalog grid.
 * Data is fetched server-side from Supabase for fast initial load.
 */
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Product } from "@/types";
import ProductGrid from "@/components/catalog/ProductGrid";
import SearchBar from "@/components/catalog/SearchBar";

/**
 * Fetches all products from Supabase.
 * RLS allows unauthenticated reads, so no auth header required.
 */
async function getProducts(): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    // In production, log this to your observability service
    console.error("[getProducts] Supabase error:", error.message);
    return [];
  }

  return (data as Product[]) ?? [];
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-cream">
      {/* ----------------------------------------------------------------
          NAVIGATION
      ---------------------------------------------------------------- */}
      <nav className="sticky top-0 z-40 bg-cream border-b border-cream-dark">
        <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Brand wordmark */}
            <Link href="/" className="font-serif text-xl sm:text-2xl text-matcha font-bold tracking-tight">
              Artrese&apos;
            </Link>

            {/* Nav actions */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link href="#catalog" className="text-sm font-medium text-sesame hover:text-matcha transition-colors hidden sm:block">
                Shop
              </Link>
              <Link href="/checkout" className="btn-primary text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5">
                View Cart
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ----------------------------------------------------------------
          HERO SECTION
      ---------------------------------------------------------------- */}
      <section className="relative bg-matcha overflow-hidden">
        {/* Background texture layer */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F1EFE7' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="max-w-2xl">
            {/* Badge */}
            <span className="inline-block bg-bean text-white text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
              Handcrafted Goods
            </span>

            {/* Headline */}
            <h1 className="font-serif text-4xl xs:text-4xl sm:text-5xl lg:text-6xl text-cream leading-tight mb-5">
              Made with hands,<br />
              <span className="italic text-latte">given with heart.</span>
            </h1>

            {/* Subtext */}
            <p className="text-latte-light text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
              Every piece in our collection is crafted by local artisans. Browse
              our curated selection of handmade items for your home, your loved
              ones, and yourself.
            </p>

            {/* CTAs */}
            <div className="flex flex-col xs:flex-row gap-3">
              <Link
                href="#catalog"
                className="inline-flex items-center justify-center gap-2
                  bg-cream text-matcha font-semibold text-sm tracking-wide
                  px-6 py-3 rounded-lg border border-cream
                  hover:bg-cream-dark transition-colors"
              >
                Browse Products
              </Link>
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center gap-2
                  bg-transparent text-cream font-semibold text-sm tracking-wide
                  px-6 py-3 rounded-lg border border-latte
                  hover:bg-matcha-dark transition-colors"
              >
                View Cart
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------
          CATALOG SECTION
      ---------------------------------------------------------------- */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl text-matcha">
              Our Products
            </h2>
            <p className="text-sesame-muted text-sm mt-1">
              {products.length} {products.length === 1 ? "item" : "items"} available
            </p>
          </div>

          {/* Client-side search — receives initial product list */}
          <div className="w-full sm:w-72">
            <SearchBar />
          </div>
        </div>

        {/* Product grid with client-side search filtering */}
        <ProductGrid initialProducts={products} />
      </section>

      {/* ----------------------------------------------------------------
          FOOTER
      ---------------------------------------------------------------- */}
      <footer className="border-t border-cream-dark mt-12">
        <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="font-serif text-lg text-matcha">Artrese&apos;</p>
            <p className="text-xs text-sesame-muted">
              All orders are processed manually. You will receive a confirmation email once payment is verified.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
