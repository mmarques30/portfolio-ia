import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["'Inter'", "'DM Sans'", "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        'kpi': ['42px', { lineHeight: '1', fontWeight: '700' }],
        'kpi-lg': ['48px', { lineHeight: '1', fontWeight: '700' }],
        'category': ['11px', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.08em' }],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        lime: {
          DEFAULT: "#A8E63D",
          50: "hsl(80, 60%, 95%)",
          100: "hsl(80, 60%, 90%)",
          500: "#A8E63D",
          600: "#8BC62A",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
        pill: "999px",
      },
      boxShadow: {
        'drawer': '-4px 0 24px rgba(0,0,0,0.08)',
      },
      keyframes: {
        'slide-up-fade': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'modal-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'slide-up': 'slide-up-fade 200ms ease',
        'modal-in': 'modal-in 200ms ease',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
