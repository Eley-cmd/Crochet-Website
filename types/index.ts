/**
 * types/index.ts
 * Centralized TypeScript interfaces for the Artrese' application.
 * All Supabase table shapes, API payloads, and UI state types live here.
 * Strict: no 'any' types used anywhere in the project.
 */

// -------------------------------------------------------------------
// DATABASE ROW TYPES (mirror Supabase table columns exactly)
// -------------------------------------------------------------------

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

/** A single line item inside an order's items JSONB column */
export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export type OrderStatus = "pending" | "paid" | "shipped" | "cancelled";

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  items: OrderItem[];
  total_amount: number;
  status: OrderStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
}

// -------------------------------------------------------------------
// FORM / REQUEST PAYLOADS
// -------------------------------------------------------------------

/** Payload submitted by the customer on the checkout page */
export interface PlaceOrderPayload {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: OrderItem[];
  total_amount: number;
  note: string;
}

/** Payload for creating a new product from the admin dashboard */
export interface CreateProductPayload {
  name: string;
  price: number;
  description: string;
  image_url: string | null;
}

/** Payload for updating order status from the admin verification table */
export interface UpdateOrderStatusPayload {
  order_id: string;
  status: OrderStatus;
}

// -------------------------------------------------------------------
// UI / COMPONENT STATE TYPES
// -------------------------------------------------------------------

/** Cart item used in local React state during shopping */
export interface CartItem {
  product: Product;
  quantity: number;
}

/** Result shape returned from all server actions / API routes */
export interface ActionResult<T = null> {
  success: boolean;
  data: T | null;
  error: string | null;
}

/** Shape of the Cloudinary upload API response (subset of fields) */
export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

/** Admin authentication state from Supabase Auth */
export interface AdminUser {
  id: string;
  email: string;
}
