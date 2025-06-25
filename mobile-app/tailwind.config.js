/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"], // Adjusted for typical Expo structure
  theme: {
    container: { // May or may not be directly applicable in NativeWind, but keeping for now
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px' // Screen sizes are less relevant in RN, but custom values can be used
      }
    },
    extend: {
      colors: {
        'wedding-red': '#D62F32',
        'wedding-orange': '#F7941D',
        'wedding-gold': '#FFD700',
        'wedding-secondaryGold': '#FF8F00',
        'wedding-cream': '#FFF8E1',
        'from-wedding-cream': '#FFF8E1',
        'to-wedding-gold': '#FFD700',
        border: 'hsl(43 30% 90%)', // These HSL values might need to be converted to hex for broader compatibility if issues arise
        input: 'hsl(45 30% 96%)',
        ring: 'hsl(43 100% 50%)',
        background: 'hsl(0 0% 100%)', // Defaulting background, will be adjusted with theme vars later if needed
        foreground: 'hsl(0 0% 3.9%)', // Defaulting foreground
        primary: {
          DEFAULT: 'hsl(0 0% 9%)', // Defaulting primary
          foreground: 'hsl(0 0% 98%)', // Defaulting primary-foreground
        },
        secondary: {
          DEFAULT: 'hsl(0 0% 96.1%)',
          foreground: 'hsl(0 0% 9%)',
        },
        destructive: {
          DEFAULT: 'hsl(0 84.2% 60.2%)',
          foreground: 'hsl(0 0% 98%)',
        },
        muted: {
          DEFAULT: 'hsl(0 0% 96.1%)',
          foreground: 'hsl(0 0% 45.1%)',
        },
        accent: {
          DEFAULT: 'hsl(0 0% 96.1%)',
          foreground: 'hsl(0 0% 9%)',
        },
        card: { // Card colors might need to be defined if not using CSS variables
          DEFAULT: 'hsl(0 0% 100%)',
          foreground: 'hsl(0 0% 3.9%)',
        },
      },
      backgroundImage: { // Background images with gradients need careful handling in RN, often requiring <LinearGradient> components
        'gradient-primary': 'linear-gradient(135deg, #FFD700, #FF8F00)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 248, 225, 0.95), rgba(255, 253, 231, 0.9))',
      },
      fontFamily: { // Ensure these fonts are loaded in Expo
        playfair: ['Playfair Display', 'serif'], // Will need to link these fonts in Expo
        poppins: ['Poppins', 'sans-serif'],   // Will need to link these fonts in Expo
        sans: ['Poppins', 'sans-serif'],
      },
      borderRadius: { // These should work fine
        lg: '0.5rem', // Using var(--radius) might not work directly, using common values
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)'
      },
      keyframes: { // Keyframes and animations are handled differently in React Native (e.g., Animated API, Reanimated)
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' } // This specific keyframe is for web Radix
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
      animation: { // These are CSS animations, will need React Native Animated/Reanimated
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'gradient-shift': 'gradientShift 20s ease-in-out infinite',
        'float': 'float 15s infinite linear',
        'fade-in': 'fadeIn 1s ease-out forwards'
      }
    }
  },
  plugins: [require("tailwindcss-animate")], // tailwindcss-animate might have limited or no effect in NativeWind. Animations are typically handled by React Native's Animated API or Reanimated.
};
