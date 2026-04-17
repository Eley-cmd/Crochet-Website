/**
 * app/api/orders/status/route.ts
 * PATCH /api/orders/status — update the status of a single order.
 * Admin-only: verifies Supabase session before mutation.
 */
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendStatusUpdateEmail } from "@/lib/email"; // Re-added the import
import type { UpdateOrderStatusPayload, ActionResult, Order, OrderStatus } from "@/types";

const VALID_STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "cancelled"];

export async function PATCH(req: NextRequest) {
  const supabase = await createSupabaseServerClient();

  // Verify admin session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json<ActionResult>({ success: false, data: null, error: "Unauthorized." }, { status: 401 });
  }

  let body: UpdateOrderStatusPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<ActionResult>({ success: false, data: null, error: "Invalid request body." }, { status: 400 });
  }

  if (!body.order_id) {
    return NextResponse.json<ActionResult>({ success: false, data: null, error: "order_id is required." }, { status: 400 });
  }
  if (!VALID_STATUSES.includes(body.status)) {
    return NextResponse.json<ActionResult>({ success: false, data: null, error: `status must be one of: ${VALID_STATUSES.join(", ")}.` }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ status: body.status })
    .eq("id", body.order_id)
    .select()
    .single();

  if (error || !data) {
    console.error("[PATCH /api/orders/status] Supabase error:", error?.message);
    return NextResponse.json<ActionResult>({ success: false, data: null, error: "Failed to update order status." }, { status: 500 });
  }

  const updatedOrder = data as Order;

  // FIXED: We now AWAIT the email so Vercel doesn't kill the function early
  try {
    await sendStatusUpdateEmail(updatedOrder);
  } catch (emailErr: unknown) {
    // We log the error but still return success because the DB was updated
    console.error("[PATCH /api/orders/status] Customer email failed:", emailErr);
  }

  return NextResponse.json<ActionResult<Order>>({
    success: true,
    data: updatedOrder,
    error: null
  });
}