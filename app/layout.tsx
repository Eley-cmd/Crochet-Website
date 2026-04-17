/**
 * app/layout.tsx
 * Root layout — applies global fonts, metadata, and background color.
 * Poppins is used for UI/body text; Libre Baskerville for headings and branding.
 */
import type { Metadata } from "next";
import { Poppins, Libre_Baskerville } from "next/font/google";
import "./globals.css";

// Load Poppins for all UI elements (buttons, labels, body copy)
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

// Load Libre Baskerville for headings and branding text
const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-libre-baskerville",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Artrese' — Handcrafted with Purpose",
    template: "%s | Artrese'",
  },
  description:
    "Artrese' offers handcrafted artisan goods made with care and intention. Browse our curated products.",
  openGraph: {
    siteName: "Artrese'",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${libreBaskerville.variable}`}>
      <body className="bg-cream font-sans text-sesame antialiased">
        {children}
      </body>
    </html>
  );
}
