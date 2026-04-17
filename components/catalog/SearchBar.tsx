"use client";
/**
 * components/catalog/SearchBar.tsx
 * Live search bar that updates the URL query param (?q=) on each keystroke.
 * ProductGrid reads this same param to filter results — no shared state needed.
 */
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") ?? "";

  /**
   * Updates the ?q= search param in the URL.
   * Using router.replace to avoid polluting browser history on every keystroke.
   */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const params = new URLSearchParams(searchParams.toString());
      const value = e.target.value;

      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="relative w-full">
      {/* Search icon */}
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <svg
          className="w-4 h-4 text-sesame-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 15.803a7.5 7.5 0 0 0 10.607 0Z"
          />
        </svg>
      </div>

      <input
        type="search"
        placeholder="Search products..."
        defaultValue={currentQuery}
        onChange={handleChange}
        className="input pl-9 pr-4"
        aria-label="Search products"
      />
    </div>
  );
}
