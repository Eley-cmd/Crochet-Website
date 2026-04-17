import type { Config } from "tailwindcss";

/**
 * Artrese' Tailwind Configuration
 * Custom design tokens aligned with the brand design system.
 * Fonts loaded via next/font in layout.tsx; referenced here for utilities.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // -----------------------------------------------------------
      // BRAND COLOR PALETTE
      // -----------------------------------------------------------
      colors: {
        // Primary: Ceremonial Matcha — headings, active buttons
        matcha: {
          DEFAULT: "#4B5D3F",
          dark: "#3A4930",
          light: "#5E7450",
        },
        // Secondary: Whisked Latte — icons, hover states, borders
        latte: {
          DEFAULT: "#A3B18A",
          dark: "#8A9873",
          light: "#BAC9A4",
        },
        // Background: Steamed Cream — main page body
        cream: {
          DEFAULT: "#F1EFE7",
          dark: "#E4E1D5",
          light: "#F8F7F3",
        },
        // Typography: Toasted Sesame — body text
        sesame: {
          DEFAULT: "#343A40",
          light: "#4F575F",
          muted: "#6C757D",
        },
        // Accent: Sweet Bean — CTA badges, notifications
        bean: {
          DEFAULT: "#D4A373",
          dark: "#BC8A5C",
          light: "#E0BC97",
        },
      },

      // -----------------------------------------------------------
      // TYPOGRAPHY
      // Poppins: UI elements, buttons, labels
      // Libre Baskerville: headings, branding, editorial text
      // -----------------------------------------------------------
      fontFamily: {
        sans: ["var(--font-poppins)", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-libre-baskerville)", "ui-serif", "Georgia"],
      },

      // -----------------------------------------------------------
      // SPACING & SIZING EXTENSIONS
      // -----------------------------------------------------------
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },

      // -----------------------------------------------------------
      // BORDER RADIUS
      // -----------------------------------------------------------
      borderRadius: {
        "4xl": "2rem",
      },

      // -----------------------------------------------------------
      // BOX SHADOWS (solid, no blur-heavy effects per design constraint)
      // -----------------------------------------------------------
      boxShadow: {
        card: "0 1px 3px 0 rgba(52, 58, 64, 0.08), 0 1px 2px -1px rgba(52, 58, 64, 0.06)",
        "card-hover": "0 4px 12px 0 rgba(52, 58, 64, 0.12), 0 2px 4px -1px rgba(52, 58, 64, 0.08)",
        inset: "inset 0 2px 4px 0 rgba(52, 58, 64, 0.06)",
        solid: "3px 3px 0px #4B5D3F",
        "solid-sm": "2px 2px 0px #4B5D3F",
      },

      // -----------------------------------------------------------
      // BREAKPOINTS (custom mobile-first additions)
      // 320px (xs) and 560px (sm+) supplement Tailwind defaults
      // -----------------------------------------------------------
      screens: {
        xs: "320px",
        // sm: "640px" (Tailwind default, covers 560px range)
        // md: "768px", lg: "1024px", xl: "1280px" remain unchanged
      },
    },
  },
  plugins: [],
};

export default config;
