"use client";
/**
 * components/admin/OrdersTable.tsx
 * Interactive orders table for the admin dashboard.
 * Allows the admin to view order details, toggle status, and delete orders.
 */
import { useState } from "react";
import React, { Fragment } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import type { Order, OrderStatus, ActionResult } from "@/types";

interface OrdersTableProps {
  initialOrders: Order[];
}

const STATUS_OPTIONS: OrderStatus[] = ["pending", "paid", "shipped", "cancelled"];

/** Map status value to a Tailwind badge class */
function statusBadgeClass(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    pending: "badge-pending",
    paid: "badge-paid",
    shipped: "badge-shipped",
    cancelled: "badge-cancelled",
  };
  return map[status];
}

/** Format ISO date string to a readable local format */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrdersTable({ initialOrders }: OrdersTableProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");

  /** Delete a single order */
  async function handleDeleteOne(orderId: string) {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    setUpdatingId(orderId);
    const supabase = createBrowserClient();
    const { error } = await supabase.from("orders").delete().eq("id", orderId);

    if (error) {
      alert("Error: " + error.message);
    } else {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      router.refresh();
    }
    setUpdatingId(null);
  }

  /** Delete ALL orders */
  async function handleDeleteAll() {
    if (!window.confirm("⚠️ Warning: This will permanently delete ALL orders. This cannot be undone. Continue?")) return;

    setUpdatingId("all");
    const supabase = createBrowserClient();
    // Using a filter that captures all UUIDs to satisfy RLS requirements
    const { error } = await supabase
      .from("orders")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      alert("Error deleting all orders: " + error.message);
    } else {
      setOrders([]);
      router.refresh();
    }
    setUpdatingId(null);
  }

  /** Update an order's status via the API */
  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/orders/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, status: newStatus }),
      });

      const result: ActionResult<Order> = await res.json();

      if (result.success && result.data) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? (result.data as Order) : o))
        );
      } else {
        alert(result.error ?? "Failed to update status.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  const displayed =
    filterStatus === "all"
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  return (
    <div className="space-y-4">
      {/* Top Header with Delete All */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Filter bar */}
        <div className="flex flex-wrap gap-2">
          {(["all", ...STATUS_OPTIONS] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide border transition-colors
                ${filterStatus === s
                  ? "bg-matcha text-cream border-matcha"
                  : "bg-white text-sesame-muted border-cream-dark hover:border-latte"
                }
              `}
            >
              {s === "all" ? "All Orders" : s}
              {s !== "all" && (
                <span className="ml-1.5 opacity-70">
                  ({orders.filter((o) => o.status === s).length})
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleDeleteAll}
          disabled={updatingId === "all" || orders.length === 0}
          className="px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-md transition-all disabled:opacity-30"
        >
          {updatingId === "all" ? "Clearing..." : "Delete All Orders"}
        </button>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream-dark border-b border-cream-dark text-sesame-muted">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider">Total</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sesame-muted text-sm italic">
                    No orders found.
                  </td>
                </tr>
              )}
              {displayed.map((order, idx) => (
                <Fragment key={order.id}>
                  <tr
                    className={`border-b border-cream-dark last:border-0 cursor-pointer hover:bg-cream/60 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-cream/30"}`}
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  >
                    {/* Customer */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-sesame">{order.customer_name}</p>
                      <p className="text-xs text-sesame-muted">{order.customer_email}</p>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-sesame-muted text-xs hidden sm:table-cell whitespace-nowrap">
                      {formatDate(order.created_at)}
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3 text-right font-semibold text-matcha whitespace-nowrap">
                      PHP {order.total_amount.toFixed(2)}
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3 text-center">
                      <span className={statusBadgeClass(order.status)}>
                        {order.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value as OrderStatus)
                          }
                          className="text-xs border border-latte rounded-md px-2 py-1.5 bg-white text-sesame focus:outline-none focus:border-matcha disabled:opacity-50 cursor-pointer"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => handleDeleteOne(order.id)}
                          disabled={updatingId === order.id}
                          className="p-1.5 text-sesame-muted hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Order"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded row — order details */}
                  {expandedId === order.id && (
                    <tr className="bg-cream/50">
                      <td colSpan={5} className="px-4 py-4 border-b border-cream-dark">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Items */}
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-sesame-muted mb-2">Items</p>
                            <ul className="space-y-1">
                              {order.items.map((item: any, i: number) => (
                                <li key={i} className="flex justify-between text-xs text-sesame">
                                  <span>
                                    {item.product_name} <span className="text-sesame-muted">x{item.quantity}</span>
                                  </span>
                                  <span className="font-medium">
                                    PHP {(item.unit_price * item.quantity).toFixed(2)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Meta */}
                          <div className="space-y-2 text-xs text-sesame">
                            {order.customer_phone && (
                              <div>
                                <span className="text-sesame-muted font-semibold uppercase tracking-wider">Phone: </span>
                                {order.customer_phone}
                              </div>
                            )}
                            <div>
                              <span className="text-sesame-muted font-semibold uppercase tracking-wider">Order ID: </span>
                              <span className="font-mono">{order.id}</span>
                            </div>
                            <div>
                              <span className="text-sesame-muted font-semibold uppercase tracking-wider">Placed: </span>
                              {formatDate(order.created_at)}
                            </div>
                            {order.note && (
                              <div>
                                <span className="text-sesame-muted font-semibold uppercase tracking-wider block mb-0.5">Note:</span>
                                <span className="italic text-sesame">{order.note}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-sesame-muted">
        Click any row to expand order details. Use the dropdown to update status or the trash icon to delete.
      </p>
    </div>
  );
}