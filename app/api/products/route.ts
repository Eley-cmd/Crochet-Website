/**
 * app/api/products/route.ts
 * POST   /api/products — create a product (admin only, verified via session)
 * DELETE /api/products?id={id} — delete a product (admin only)
 *
 * RLS on Supabase enforces that only authenticated users can mutate products.
 * The server client sends the session cookie, which Supabase validates.
 */
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CreateProductPayload, ActionResult, Product } from "@/types";

/** POST /api/products — insert a new product */
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();

  // Verify admin session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json<ActionResult>({ success: false, data: null, error: "Unauthorized." }, { status: 401 });
  }

  let body: CreateProductPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<ActionResult>({ success: false, data: null, error: "Invalid request body." }, { status: 400 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json<ActionResult>({ success: false, data: null, error: "Product name is required." }, { status: 400 });
  }
  if (body.price == null || body.price < 0) {
    return NextResponse.json<ActionResult>({ success: false, data: null, error: "Valid price is required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      name: body.name.trim(),
      price: body.price,
      description: body.description?.trim() || null,
      image_url: body.image_url || null,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("[POST /api/products] Supabase error:", error?.message);
    return NextResponse.json<ActionResult>({ success: false, data: null, error: "Failed to create product." }, { status: 500 });
  }

  return NextResponse.json<ActionResult<Product>>({ success: true, data: data as Product, error: null }, { status: 201 });
}

/** DELETE /api/products?id={id} — remove a product by ID */
export async function DELETE(req: NextRequest) {
  const supabase = await createSupabaseServerClient();

  // Verify admin session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json<ActionResult>({ success: false, data: null, error: "Unauthorized." }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json<ActionResult>({ success: false, data: null, error: "Product ID is required." }, { status: 400 });
  }

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    console.error("[DELETE /api/products] Supabase error:", error.message);
    return NextResponse.json<ActionResult>({ success: false, data: null, error: "Failed to delete product." }, { status: 500 });
  }

  return NextResponse.json<ActionResult>({ success: true, data: null, error: null });
}
