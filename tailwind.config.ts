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
        'wedding-gold': '#FFD700',
        'wedding-secondaryGold': '#FFC400',
        'wedding-cream': '#FFF8E1',
        'wedding-red': '#D62F32',
        'wedding-purple': '#8A2BE2',
        'futuristic-background': '#0A0A0A',
        'futuristic-primary': '#1E1E1E',
        'futuristic-secondary': '#333333',
        'futuristic-accent': '#00BFFF',
        'futuristic-primary-accent': '#FF4500',
        'futuristic-secondary-accent': '#1E90FF',
        'futuristic-text-primary': '#FFFFFF',
        'futuristic-text-secondary': '#B0B0B0',
        'futuristic-gold': '#FFD700', // Added futuristic-gold to resolve Tailwind warning

        // New Design System Colors
        primary: {
          DEFAULT: 'oklch(60% 0.15 30)', // A warm, inviting primary color
          foreground: 'oklch(95% 0.02 30)', // Light text on primary
        },
        secondary: {
          DEFAULT: 'oklch(85% 0.05 60)', // A soft, complementary secondary color
          foreground: 'oklch(20% 0.02 60)', // Dark text on secondary
        },
        accent: {
          DEFAULT: 'oklch(75% 0.1 90)', // A subtle accent color
          foreground: 'oklch(20% 0.02 90)', // Dark text on accent
        },
        destructive: {
          DEFAULT: 'oklch(60% 0.15 15)', // A clear, but not harsh, red
          foreground: 'oklch(95% 0.02 15)', // Light text on destructive
        },
        background: 'oklch(98% 0.01 60)', // Soft, light background
        foreground: 'oklch(20% 0.02 60)', // Dark text for readability
        'text-secondary': 'oklch(45% 0.02 60)', // Lighter text for secondary information
        border: 'oklch(90% 0.01 60)', // Subtle border color
        'card-bg': 'oklch(100% 0.01 60)', // Slightly off-white for cards

        // Existing HSL colors (will be updated in index.css)
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        '0': '0',
        '1': '0.25rem',   // 4px
        '2': '0.5rem',    // 8px
        '3': '0.75rem',   // 12px
        '4': '1rem',      // 16px
        '5': '1.25rem',   // 20px
        '6': '1.5rem',    // 24px
        '8': '2rem',      // 32px
        '10': '2.5rem',   // 40px
        '12': '3rem',     // 48px
        '16': '4rem',     // 64px
        '20': '5rem',     // 80px
        '24': '6rem',     // 96px
        '32': '8rem',     // 128px
        '40': '10rem',    // 160px
        '48': '12rem',    // 192px
        '56': '14rem',    // 224px
        '64': '16rem',    // 256px
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Roboto', 'sans-serif'],
        sans: ['Roboto', 'sans-serif'], // Default sans-serif
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
        'gentle-pulse': 'gentle-pulse 4s infinite 0.5s ease-in-out',
        'speaking-pulse': 'speaking-pulse 1.2s infinite ease-in-out',
        'speaking-ring-1': 'speaking-ring-1 1.2s infinite ease-in-out',
        'speaking-ring-2': 'speaking-ring-2 1.2s infinite ease-in-out',
      },
    },
  },
  plugins: [tailwindcssAnimate, typography, function ({ addUtilities }: any) {
    addUtilities({
      '.high-priority-day': {
        'background-color': '#D62F32 !important' as const,
        'color': 'white !important' as const,
      },
      '.medium-priority-day': {
        'background-color': '#8A2BE2 !important' as const,
        'color': 'white !important' as const,
      },
      '.low-priority-day': {
        'background-color': '#FFD700 !important' as const,
        'color': 'black !important' as const,
      },
      '.has-tasks-day': {
        'font-weight': 'bold !important' as const,
      },
    })
  }],
}

export default config
