import tailwindcssAnimate from "tailwindcss-animate"
import typography from "@tailwindcss/typography"

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        'futuristic-bg': '#FDF6E3',
        'futuristic-primary-accent': '#8B0000',
        'futuristic-secondary-accent': '#000080',
        'futuristic-gold': '#FFD700',
        'futuristic-text-primary': '#4A4A4A',
        'futuristic-text-secondary': '#6c757d',
        'futuristic-container-bg': '#FFFFFF',
        'futuristic-border': '#eee',
        'wedding-red': '#D62F32',
        'wedding-orange': '#F7941D',
        'wedding-gold': '#B8860B', // Darker gold for better contrast (4.5:1 ratio)
        'wedding-secondaryGold': '#E67E00', // Darker secondary gold
        'wedding-cream': '#FFF8E1',
        'wedding-brown': '#4A3728', // Dark brown for high contrast
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        lora: ['"Lora"', 'serif'],
        lato: ['"Lato"', 'sans-serif'],
        sans: ['"Lato"', 'sans-serif'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        'gentle-pulse': {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '0.8' },
          '50%': { transform: 'translate(-50%, -50%) scale(1.05)', opacity: '1' },
        },
        'speaking-pulse': {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(0.95)', opacity: '0.9' },
          '50%': { transform: 'translate(-50%, -50%) scale(1.1)', opacity: '1' },
        },
        'speaking-ring-1': {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '0.5' },
          '50%': { transform: 'translate(-50%, -50%) scale(1.1)', opacity: '0.8' },
        },
        'speaking-ring-2': {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '0.3' },
          '50%': { transform: 'translate(-50%, -50%) scale(1.15)', opacity: '0.6' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'gentle-pulse': 'gentle-pulse 4s infinite ease-in-out',
        'speaking-pulse': 'speaking-pulse 1.2s infinite ease-in-out',
        'speaking-ring-1': 'speaking-ring-1 1.2s infinite ease-in-out',
        'speaking-ring-2': 'speaking-ring-2 1.2s infinite ease-in-out',
      },
    },
  },
  plugins: [tailwindcssAnimate, typography],
}

export default config
