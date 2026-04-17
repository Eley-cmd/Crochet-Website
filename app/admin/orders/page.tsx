/**
 * app/admin/orders/page.tsx
 * Order Verification Table — admin views all orders and updates their status.
 */
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Order } from "@/types";
import OrdersTable from "@/components/admin/OrdersTable";

async function getOrders(): Promise<Order[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin/orders] Supabase error:", error.message);
    return [];
  }

  return (data as Order[]) ?? [];
}

export const metadata = { title: "Orders" };

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div>
      <h1 className="font-serif text-2xl sm:text-3xl text-matcha mb-2">Orders</h1>
      <p className="text-sesame-muted text-sm mb-8">
        Review customer orders and update their payment and fulfillment status.
      </p>
      <OrdersTable initialOrders={orders} />
    </div>
  );
}
