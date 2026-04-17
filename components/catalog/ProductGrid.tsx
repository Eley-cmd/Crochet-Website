"use client";

/**
 * components/catalog/ProductGrid.tsx
 * Renders the product grid on the homepage.
 * Receives the full product list from the server component and filters
 * locally based on the search query stored in the URL search param.
 */
import { useSearchParams } from "next/navigation";
import type { Product } from "@/types";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  /** Full list of products fetched server-side */
  initialProducts: Product[];
}
export default function ProductGrid({ initialProducts }: ProductGridProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase().trim() ?? "";
  // Filter products locally — instant, no network round-trip
  const filtered = query
    ? initialProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.description ?? "").toLowerCase().includes(query)
    )
    : initialProducts;

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-cream-dark flex items-center justify-center mb-4">
          <svg
            className="w-7 h-7 text-sesame-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 15.803a7.5 7.5 0 0 0 10.607 0Z"
            />
          </svg>
        </div>
        <p className="font-serif text-lg text-matcha mb-1">No items found</p>
        <p className="text-sm text-sesame-muted">
          {query ? `No results for "${query}". Try a different search.` : "Check back soon — new items are on the way."}
        </p>
      </div>
    );
  }

  // components/catalog/ProductGrid.tsx
  // ... (keep imports and logic the same)

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
      {filtered.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}