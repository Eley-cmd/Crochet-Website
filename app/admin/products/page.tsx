/**
 * app/admin/products/page.tsx
 * Product Manager — list all products, add new ones, and delete existing ones.
 * Product data mutations happen via /api/products route handlers.
 */
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Product } from "@/types";
import ProductManager from "@/components/admin/ProductManager";

/** Fetch all products for the admin table */
async function getProducts(): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin/products] Supabase error:", error.message);
    return [];
  }

  return (data as Product[]) ?? [];
}

export const metadata = { title: "Product Manager" };

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <h1 className="font-serif text-2xl sm:text-3xl text-matcha mb-2">Product Manager</h1>
      <p className="text-sesame-muted text-sm mb-8">
        Add, edit, or remove products from your catalog.
      </p>

      {/* Client component handles all mutations */}
      <ProductManager initialProducts={products} />
    </div>
  );
}
