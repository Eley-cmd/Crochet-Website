/**
 * app/api/orders/route.ts
 * POST /api/orders
 * Validates the payload, inserts a new order into Supabase,
 * then fires a Gmail notification email to the admin.
 *
 * Uses the anon key (not service role) so RLS enforces insert-only public access.
 */
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { sendOrderNotificationEmail } from "@/lib/email";
import type { PlaceOrderPayload, ActionResult, Order } from "@/types";

export async function POST(req: NextRequest) {
  let body: PlaceOrderPayload;

  try {
    body = await req.json();
  } catch {
    const result: ActionResult = {
      success: false,
      data: null,
      error: "Invalid request body.",
    };
    return NextResponse.json(result, { status: 400 });
  }

  // Basic server-side validation
  if (!body.customer_name?.trim()) {
    return NextResponse.json<ActionResult>({ success: false, data: null, error: "Customer name is required." }, { status: 400 });
  }
  if (!body.customer_email?.trim()) {
    return NextResponse.json<ActionResult>({ success: false, data: null, error: "Customer email is required." }, { status: 400 });
  }
  if (!body.items?.length) {
    return NextResponse.json<ActionResult>({ success: false, data: null, error: "Order must contain at least one item." }, { status: 400 });
  }
  if (body.total_amount <= 0) {
    return NextResponse.json<ActionResult>({ success: false, data: null, error: "Invalid order total." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  // Insert order — RLS allows public inserts on the orders table
  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer_name: body.customer_name.trim(),
      customer_email: body.customer_email.trim().toLowerCase(),
      customer_phone: body.customer_phone?.trim() || null,
      items: body.items,
      total_amount: body.total_amount,
      note: body.note?.trim() || null,
      status: "pending",
    })
    .select()
    .single();

  if (error || !data) {
    console.error("[POST /api/orders] Supabase insert error:", error?.message, error?.details, error?.hint);
    return NextResponse.json<ActionResult>({
      success: false,
      data: null,
      error: `Failed to save your order: ${error?.message ?? "Unknown database error."}`,
    }, { status: 500 });
  }

  const order = data as Order;

  // WAIT for the email to finish before sending the success response
  try {
    await sendOrderNotificationEmail(order);
  } catch (emailError) {
    // We log the error but still return success:true because the order IS in the DB
    console.error("[POST /api/orders] Email notification failed:", emailError);
  }

  return NextResponse.json<ActionResult<Order>>({
    success: true,
    data: order,
    error: null,
  }, { status: 201 });
}
