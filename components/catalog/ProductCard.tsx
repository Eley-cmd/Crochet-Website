"use client";
/**
 * components/catalog/ProductCard.tsx
 * Individual product card in the catalog grid.
 * Combines Shopee-style 2-column mobile layout with Libre Baskerville/Poppins fonts.
 */
import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23E4E1D5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='serif' font-size='16' fill='%23A3B18A'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function ProductCard({ product }: ProductCardProps) {
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    try {
      const raw = localStorage.getItem("artrese_cart");
      const cart: Array<{ product: Product; quantity: number }> = raw
        ? JSON.parse(raw)
        : [];

      const existingIndex = cart.findIndex((item) => item.product.id === product.id);
      if (existingIndex >= 0) {
        cart[existingIndex].quantity += 1;
      } else {
        cart.push({ product, quantity: 1 });
      }

      localStorage.setItem("artrese_cart", JSON.stringify(cart));

      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch {
      console.error("[ProductCard] Failed to update cart in localStorage");
    }
  }

  return (
    <article className="flex flex-col group bg-white rounded-xl border border-cream-dark overflow-hidden transition-all duration-300 hover:shadow-card-hover">

      {/* 1. PRODUCT IMAGE - Square Aspect Ratio */}
      <div className="relative w-full aspect-square bg-cream-dark overflow-hidden">
        <Image
          src={product.image_url ?? PLACEHOLDER_IMG}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          unoptimized={!product.image_url}
        />
      </div>

      {/* 2. CARD CONTENT - Tighter padding for mobile grid */}
      <div className="flex flex-col flex-1 p-3 sm:p-4">

        {/* Name - Libre Baskerville */}
        <h3 className="font-serif text-sm sm:text-base text-matcha font-bold leading-tight line-clamp-2 min-h-[2.5rem] mb-1">
          {product.name}
        </h3>

        {/* Description - Poppins (Always visible, clean clamping) */}
        {product.description && (
          <p className="font-sans text-[10px] sm:text-xs text-sesame-muted leading-relaxed line-clamp-2 mb-3 h-[2.2rem] sm:h-[2.5rem]">
            {product.description}
          </p>
        )}

        {/* 3. PRICE & CTA - Fixed at bottom */}
        <div className="mt-auto pt-2 border-t border-cream-light flex flex-col gap-2">

          <span className="font-sans font-bold text-matcha text-sm sm:text-base tracking-tight">
            ₱{product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>

          <button
            onClick={handleAddToCart}
            className={`
              w-full font-sans text-[10px] sm:text-xs font-bold py-2 rounded-lg border transition-all duration-150 uppercase tracking-widest
              ${added
                ? "bg-latte border-latte text-white"
                : "bg-matcha border-matcha text-cream hover:bg-matcha-dark"
              }
            `}
          >
            {added ? "Added!" : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}