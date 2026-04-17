/**
 * lib/email.ts
 * Email notification helper for Artrese'
 * Handles both Admin alerts and Customer status updates.
 */
import nodemailer from "nodemailer";
import type { Order } from "@/types";

/** Singleton transporter — reused across requests */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Shared Helper: Formats order items into HTML table rows
 */
function formatItemRows(items: Order["items"]): string {
  return items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #E4E1D5;">${item.product_name}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #E4E1D5; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #E4E1D5; text-align: right;">
          PHP ${(item.unit_price * item.quantity).toFixed(2)}
        </td>
      </tr>`
    )
    .join("");
}

/**
 * 1. ADMIN NOTIFICATION: Sent when a new order is placed.
 */
export async function sendOrderNotificationEmail(order: Order): Promise<void> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL ?? process.env.GMAIL_USER;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8" /></head>
    <body style="margin: 0; padding: 0; background-color: #F1EFE7; font-family: sans-serif;">
      <table width="100%" style="padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" style="background-color: #FFFFFF; border: 1px solid #E4E1D5; border-radius: 8px; overflow: hidden;">
              <tr>
                <td style="background-color: #4B5D3F; padding: 28px 32px;">
                  <h1 style="margin: 0; color: #F1EFE7; font-size: 22px;">Artrese'</h1>
                  <p style="margin: 6px 0 0; color: #A3B18A; font-size: 13px;">New Order Received</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 28px 32px;">
                  <p style="color: #6C757D; font-size: 12px; text-transform: uppercase;">Order ID</p>
                  <p style="color: #343A40; font-family: monospace;">${order.id}</p>
                  <p style="color: #6C757D; font-size: 12px; text-transform: uppercase;">Customer</p>
                  <p style="font-weight: 600; color: #343A40;">${order.customer_name}</p>
                  <p style="color: #343A40;">${order.customer_email}</p>
                  ${order.customer_phone ? `<p style="color: #343A40;">${order.customer_phone}</p>` : ""}
                  
                  <table width="100%" style="border: 1px solid #E4E1D5; margin-top: 20px; font-size: 14px;">
                    <thead style="background-color: #F1EFE7;">
                      <tr>
                        <th style="padding: 8px 12px; text-align: left;">Product</th>
                        <th style="padding: 8px 12px;">Qty</th>
                        <th style="padding: 8px 12px; text-align: right;">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>${formatItemRows(order.items)}</tbody>
                  </table>
                  <p style="text-align: right; color: #4B5D3F; font-size: 20px; font-weight: 700;">
                    Total: PHP ${order.total_amount.toFixed(2)}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #F8F7F3; border-top: 1px solid #E4E1D5; padding: 20px 32px; text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" 
                     style="display: inline-block; background-color: #4B5D3F; color: #F1EFE7; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-weight: 600;">
                    Open Admin Dashboard
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>`;

  await transporter.sendMail({
    from: `"Artrese' Shop" <${process.env.GMAIL_USER}>`,
    to: adminEmail,
    subject: `New Order: ${order.customer_name} - PHP ${order.total_amount.toFixed(2)}`,
    html,
  });
}

/**
 * 2. CUSTOMER NOTIFICATION: Sent when the admin updates an order status.
 */
const STATUS_META: Record<string, { label: string; color: string; message: string }> = {
  paid: {
    label: "Payment Confirmed",
    color: "#3A6B35",
    message: "Great news! We have received and confirmed your payment. Your order is now being prepared with care.",
  },
  shipped: {
    label: "Order Shipped",
    color: "#1E5799",
    message: "Your order is on its way! It has been handed off for delivery. We hope it reaches you soon.",
  },
  cancelled: {
    label: "Order Cancelled",
    color: "#B33A3A",
    message: "Your order has been cancelled. If you believe this is a mistake, please reach out to us.",
  },
  pending: {
    label: "Order Pending",
    color: "#8A6200",
    message: "Your order is currently pending review. We will update you as soon as we confirm the details.",
  },
};

export async function sendStatusUpdateEmail(order: Order): Promise<void> {
  const meta = STATUS_META[order.status] ?? {
    label: order.status,
    color: "#4B5D3F",
    message: `Your order status has been updated to: ${order.status}.`,
  };

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8" /></head>
    <body style="margin: 0; padding: 0; background-color: #F1EFE7; font-family: sans-serif;">
      <table width="100%" style="padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" style="background-color: #FFFFFF; border: 1px solid #E4E1D5; border-radius: 8px; overflow: hidden;">
              <tr>
                <td style="background-color: #4B5D3F; padding: 28px 32px;">
                  <h1 style="margin: 0; color: #F1EFE7; font-size: 22px;">Artrese'</h1>
                  <p style="margin: 6px 0 0; color: #A3B18A; font-size: 13px;">Order Status Update</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 28px 32px;">
                  <span style="background-color: ${meta.color}; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 5px 14px; border-radius: 20px;">
                    ${meta.label}
                  </span>
                  <p style="margin-top: 20px; font-size: 15px; font-weight: 600;">Hi ${order.customer_name},</p>
                  <p style="font-size: 14px; line-height: 1.7;">${meta.message}</p>
                  
                  <div style="background-color: #F8F7F3; border: 1px solid #E4E1D5; border-radius: 6px; padding: 16px 20px; margin: 24px 0;">
                    <p style="font-size: 11px; font-weight: 700; color: #6C757D; text-transform: uppercase;">Order Summary</p>
                    ${order.items.map(i => `<p style="font-size: 13px;">${i.product_name} x${i.quantity} <span style="float:right;">PHP ${(i.unit_price * i.quantity).toFixed(2)}</span></p>`).join("")}
                    <div style="border-top: 1px solid #E4E1D5; margin: 12px 0;"></div>
                    <p style="font-weight: 700; color: #4B5D3F;">Total <span style="float:right;">PHP ${order.total_amount.toFixed(2)}</span></p>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background-color: #F8F7F3; border-top: 1px solid #E4E1D5; padding: 20px 32px; text-align: center; color: #6C757D; font-size: 12px;">
                  Thank you for supporting handmade.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>`;

  await transporter.sendMail({
    from: `"Artrese' Shop" <${process.env.GMAIL_USER}>`,
    to: order.customer_email,
    subject: `Your Artrese' Order — ${meta.label}`,
    html,
  });
}