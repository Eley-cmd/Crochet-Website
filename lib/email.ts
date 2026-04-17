/**
 * lib/email.ts
 * Email notification helper for new orders.
 * Uses Nodemailer with a Gmail App Password (SMTP).
 *
 * Setup:
 *   1. Enable 2-Step Verification on the Gmail account.
 *   2. Generate an App Password at myaccount.google.com/apppasswords.
 *   3. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local.
 */
import nodemailer from "nodemailer";
import type { Order } from "@/types";

/** Singleton transporter — reused across requests in the same server instance */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Formats a list of order items into an HTML table row string
 * for inclusion in the notification email body.
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
 * Sends an order notification email to the store admin.
 * Called from the /api/orders route handler after a successful DB insert.
 *
 * @param order - The full order record just inserted into Supabase.
 */
export async function sendOrderNotificationEmail(order: Order): Promise<void> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL ?? process.env.GMAIL_USER;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>New Order - Artrese'</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F1EFE7; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0"
              style="background-color: #FFFFFF; border: 1px solid #E4E1D5; border-radius: 8px; overflow: hidden;">

              <!-- Header -->
              <tr>
                <td style="background-color: #4B5D3F; padding: 28px 32px;">
                  <h1 style="margin: 0; color: #F1EFE7; font-size: 22px; letter-spacing: 1px;">
                    Artrese'
                  </h1>
                  <p style="margin: 6px 0 0; color: #A3B18A; font-size: 13px;">
                    New Order Received
                  </p>
                </td>
              </tr>

              <!-- Order Meta -->
              <tr>
                <td style="padding: 28px 32px;">
                  <p style="margin: 0 0 4px; color: #6C757D; font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px;">
                    Order ID
                  </p>
                  <p style="margin: 0 0 20px; color: #343A40; font-size: 14px; font-family: monospace;">
                    ${order.id}
                  </p>

                  <p style="margin: 0 0 4px; color: #6C757D; font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px;">
                    Customer
                  </p>
                  <p style="margin: 0 0 4px; color: #343A40; font-size: 15px; font-weight: 600;">
                    ${order.customer_name}
                  </p>
                  <p style="margin: 0 0 4px; color: #343A40; font-size: 14px;">${order.customer_email}</p>
                  ${order.customer_phone ? `<p style="margin: 0 0 20px; color: #343A40; font-size: 14px;">${order.customer_phone}</p>` : ""}

                  ${order.note ? `
                  <p style="margin: 16px 0 4px; color: #6C757D; font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px;">
                    Customer Note
                  </p>
                  <p style="margin: 0 0 20px; color: #343A40; font-size: 14px; background: #F8F7F3; padding: 10px 14px; border-left: 3px solid #A3B18A; border-radius: 2px;">
                    ${order.note}
                  </p>` : ""}

                  <!-- Items Table -->
                  <p style="margin: 20px 0 8px; color: #6C757D; font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px;">
                    Items Ordered
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0"
                    style="border: 1px solid #E4E1D5; border-radius: 6px; overflow: hidden; font-size: 14px; color: #343A40;">
                    <thead>
                      <tr style="background-color: #F1EFE7;">
                        <th style="padding: 8px 12px; text-align: left; font-weight: 600; font-size: 12px; color: #6C757D; text-transform: uppercase;">Product</th>
                        <th style="padding: 8px 12px; text-align: center; font-weight: 600; font-size: 12px; color: #6C757D; text-transform: uppercase;">Qty</th>
                        <th style="padding: 8px 12px; text-align: right; font-weight: 600; font-size: 12px; color: #6C757D; text-transform: uppercase;">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${formatItemRows(order.items)}
                    </tbody>
                  </table>

                  <!-- Total -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px;">
                    <tr>
                      <td style="text-align: right; padding-right: 12px; color: #6C757D; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        Total Amount
                      </td>
                      <td style="text-align: right; width: 130px; color: #4B5D3F; font-size: 20px; font-weight: 700;">
                        PHP ${order.total_amount.toFixed(2)}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- CTA Footer -->
              <tr>
                <td style="background-color: #F8F7F3; border-top: 1px solid #E4E1D5; padding: 20px 32px; text-align: center;">
                  <p style="margin: 0 0 12px; font-size: 13px; color: #6C757D;">
                    Log in to the admin dashboard to review and update this order.
                  </p>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin"
                    style="display: inline-block; background-color: #4B5D3F; color: #F1EFE7; text-decoration: none;
                      padding: 10px 24px; border-radius: 6px; font-size: 14px; font-weight: 600; letter-spacing: 0.3px;">
                    Open Admin Dashboard
                  </a>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Artrese' Shop" <${process.env.GMAIL_USER}>`,
    to: adminEmail,
    subject: `New Order from ${order.customer_name} - PHP ${order.total_amount.toFixed(2)}`,
    html,
  });
}
