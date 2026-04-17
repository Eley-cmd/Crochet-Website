"use client";
/**
 * app/checkout/page.tsx
 * Customer checkout page.
 * Reads cart from localStorage, collects customer info,
 * then POSTs to /api/orders which stores the order and triggers a Gmail notification.
 */
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CartItem, PlaceOrderPayload, ActionResult, Order } from "@/types";

/** Initial form state shape */
interface CustomerForm {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  note: string;
}

const EMPTY_FORM: CustomerForm = {
  customer_name: "",
  customer_email: "",
  customer_phone: "",
  note: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [form, setForm] = useState<CustomerForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  /** Load cart from localStorage on mount */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("artrese_cart");
      setCart(raw ? JSON.parse(raw) : []);
    } catch {
      setCart([]);
    }
  }, []);

  /* Recalculate total whenever cart changes */
  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  /* Update a single form field */
  function handleField(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  /* Update item quantity or remove if set to 0 */
  function updateQuantity(productId: string, delta: number) {
    setCart((prev) => {
      const updated = prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0);
      localStorage.setItem("artrese_cart", JSON.stringify(updated));
      return updated;
    });
  }

  /* Remove an item entirely */
  function removeItem(productId: string) {
    setCart((prev) => {
      const updated = prev.filter((item) => item.product.id !== productId);
      localStorage.setItem("artrese_cart", JSON.stringify(updated));
      return updated;
    });
  }

  /* Submit order to the API route */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload: PlaceOrderPayload = {
      ...form,
      total_amount: total,
      items: cart.map((item) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
      })),
    };

    // Kupal balikan mo mamaya ito ah pag nagdeploy ka niiii
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result: ActionResult<Order> = await res.json();

      if (!result.success || !result.data) {
        setError(result.error ?? "Something went wrong. Please try again.");
        return;
      }

      // Clear cart and show success screen
      localStorage.removeItem("artrese_cart");
      setOrderId(result.data.id);
      setSuccess(true);
    } catch {
      setError("A network error occurred. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  }


  // SUCCESS STATE

  if (success) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-matcha flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl text-matcha mb-3">Order Received</h1>
          <p className="text-sesame-muted text-sm mb-2">
            Thank you, {form.customer_name}. Your order has been placed successfully.
          </p>
          {orderId && (
            <p className="text-xs font-mono bg-cream-dark text-sesame-muted rounded px-3 py-2 inline-block mb-6">
              Order ID: {orderId}
            </p>
          )}
          <p className="text-sesame text-sm mb-8">
            The seller has been notified and will contact you at{" "}
            <strong>{form.customer_email}</strong> to coordinate payment and delivery.
          </p>
          <Link href="/" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  // EMPTY CART

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <p className="font-serif text-2xl text-matcha mb-2">Your cart is empty</p>
          <p className="text-sesame-muted text-sm mb-6">Add items from the catalog to get started.</p>
          <Link href="/" className="btn-primary">Browse Products</Link>
        </div>
      </main>
    );
  }

  // CHECKOUT FORM

  return (
    <main className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-cream border-b border-cream-dark">
        <div className="max-w-5xl mx-auto px-4 xs:px-5 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl text-matcha font-bold">
            Artrese&apos;
          </Link>
          <Link href="/" className="text-sm text-sesame hover:text-matcha transition-colors">
            Back to Shop
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 xs:px-5 sm:px-6 py-10 sm:py-14">
        <h1 className="font-serif text-2xl sm:text-3xl text-matcha mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">

            {/* LEFT: Customer Info */}
            <div className="lg:col-span-3 space-y-5">
              <div className="card">
                <h2 className="font-serif text-lg text-matcha mb-5">Your Information</h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="customer_name" className="label">Full Name *</label>
                    <input
                      id="customer_name"
                      name="customer_name"
                      type="text"
                      required
                      value={form.customer_name}
                      onChange={handleField}
                      className="input"
                      placeholder="Maria Santos"
                    />
                  </div>

                  <div>
                    <label htmlFor="customer_email" className="label">Email Address *</label>
                    <input
                      id="customer_email"
                      name="customer_email"
                      type="email"
                      required
                      value={form.customer_email}
                      onChange={handleField}
                      className="input"
                      placeholder="maria@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="customer_phone" className="label">Phone Number</label>
                    <input
                      id="customer_phone"
                      name="customer_phone"
                      type="tel"
                      value={form.customer_phone}
                      onChange={handleField}
                      className="input"
                      placeholder="+63 9XX XXX XXXX"
                    />
                  </div>

                  <div>
                    <label htmlFor="note" className="label">Order Note (optional)</label>
                    <textarea
                      id="note"
                      name="note"
                      rows={3}
                      value={form.note}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, note: e.target.value }))
                      }
                      className="input resize-none"
                      placeholder="Any special requests or delivery instructions..."
                    />
                  </div>
                </div>
              </div>

              {/* Payment note */}
              <div className="rounded-lg border border-bean/40 bg-bean/5 p-4">
                <p className="text-sm text-sesame font-medium mb-1">Payment Instructions</p>
                <p className="text-xs text-sesame-muted leading-relaxed">
                  After submitting your order, the seller will reach out to you via email
                  with payment and delivery details. No payment is collected on this page.
                </p>
              </div>
            </div>

            {/* RIGHT: Order Summary */}
            <div className="lg:col-span-2">
              <div className="card sticky top-20">
                <h2 className="font-serif text-lg text-matcha mb-5">Order Summary</h2>

                {/* Cart items */}
                <ul className="space-y-3 mb-5">
                  {cart.map((item) => (
                    <li key={item.product.id} className="flex items-start gap-3">
                      {/* Qty controls */}
                      <div className="flex items-center border border-cream-dark rounded-md overflow-hidden text-sm">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="px-2 py-1 text-sesame hover:bg-cream-dark transition-colors"
                          aria-label={`Decrease quantity of ${item.product.name}`}
                        >
                          -
                        </button>
                        <span className="px-2 py-1 text-sesame font-medium min-w-[1.5rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="px-2 py-1 text-sesame hover:bg-cream-dark transition-colors"
                          aria-label={`Increase quantity of ${item.product.name}`}
                        >
                          +
                        </button>
                      </div>

                      {/* Name & price */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-sesame truncate">{item.product.name}</p>
                        <p className="text-xs text-sesame-muted">
                          PHP {item.product.price.toFixed(2)} each
                        </p>
                      </div>

                      {/* Subtotal + remove */}
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-matcha">
                          PHP {(item.product.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id)}
                          className="text-xs text-red-500 hover:text-red-700 transition-colors mt-0.5"
                          aria-label={`Remove ${item.product.name}`}
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Total */}
                <div className="flex justify-between items-center border-t border-cream-dark pt-4 mb-5">
                  <span className="font-semibold text-sesame">Total</span>
                  <span className="font-serif text-xl text-matcha font-bold">
                    PHP {total.toFixed(2)}
                  </span>
                </div>

                {/* Error */}
                {error && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
                    {error}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting || cart.length === 0}
                  className="btn-primary w-full"
                >
                  {submitting ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
