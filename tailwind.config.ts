import tailwindcssAnimate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./index.html",
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {      colors: {
        'wedding-red': '#D62F32',
        'wedding-orange': '#F7941D',
        'wedding-gold': '#B8860B', // Darker gold for better contrast (4.5:1 ratio)
        'wedding-secondaryGold': '#E67E00', // Darker secondary gold
        'wedding-cream': '#FFF8E1',
        'wedding-brown': '#4A3728', // Dark brown for high contrast
        'from-wedding-cream': '#FFF8E1', // alias for gradient usage
        'to-wedding-gold': '#B8860B',    // Updated alias for gradient usage
        border: 'hsl(43 30% 90%)',
        input: 'hsl(45 30% 96%)',
        ring: 'hsl(43 100% 50%)',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #FFD700, #FF8F00)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 248, 225, 0.95), rgba(255, 253, 231, 0.9))',
      },
      screens: {
        'xs': '475px',
      },
      fontFamily: {
        lato: ['Lato', 'sans-serif'],
        lora: ['Lora', 'serif'],
        sans: ['Lato', 'sans-serif'], // Set Lato as the default sans-serif font
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'gradientShift': {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' }
        },
        'float': {
          '0%': { transform: 'translateY(100vh) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '0.7' },
          '90%': { opacity: '0.7' },
          '100%': { transform: 'translateY(-100px) rotate(360deg)', opacity: '0' }
        },
        'fadeIn': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'gradient-shift': 'gradientShift 20s ease-in-out infinite',
        'float': 'float 15s infinite linear',
        'fade-in': 'fadeIn 1s ease-out forwards'
      }
    }
  },
  plugins: [tailwindcssAnimate, typography],
};

export default config;
