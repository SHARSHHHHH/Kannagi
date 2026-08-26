/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep midnight navy. Represents dignity, authority, and emotional safety.
        dusk: {
          50: '#F0F4FA', 100: '#DDE5F2', 200: '#BACBE3', 300: '#8FAACE',
          400: '#6483B2', 500: '#436192', 600: '#2B3A67', 700: '#1E2A4D',
          800: '#141D36', 900: '#0B1220', 950: '#060A14',
        },
        // Warm ivory and cream surfaces replacing harsh cool grays.
        ivory: {
          50: '#FDFBF7', 100: '#FAF6F0', 200: '#F2ECE1', 300: '#E6DCCD',
          400: '#D4C6B2', 500: '#BAA78F', 600: '#9E8B73',
        },
        // Muted teal / jade for safe states and verified items.
        jade: {
          50: '#EDF7F5', 100: '#D4EBE6', 200: '#A9D6CC', 300: '#75B8AA',
          400: '#4B9889', 500: '#2F7D72', 600: '#24635A', 700: '#1B4A43',
          800: '#13342F',
        },
        // Muted gold accents inspired by the silambu / anklet motif.
        brass: {
          50: '#FDF8EC', 100: '#F9EED4', 200: '#F2DFA9', 300: '#E4CA7E',
          400: '#D4AF37', 500: '#BE9B4B', 600: '#9C7D37', 700: '#775E27',
        },
        // Subtle wine / rose tones reserved for urgent safety actions / notices.
        wine: {
          50: '#FDF2F4', 100: '#FCE4E8', 200: '#F8C9D2', 300: '#F09BB0',
          400: '#E46284', 500: '#D13B63', 600: '#B0254B', 700: '#881337',
          800: '#630D28', 900: '#43081A',
        },
        mist: {
          50: '#FAFBFC', 100: '#F4F6F9', 200: '#E8ECF2', 300: '#D6DDE7',
          400: '#B4BFCE', 500: '#8794A8', 600: '#5E6B7E', 700: '#444F61',
        },
        alert: { 50: '#FDF3EE', 200: '#F5CDB6', 500: '#C2410C', 700: '#9A3412' },
      },
      fontFamily: {
        display: ['"Noto Serif Tamil"', 'Georgia', 'serif'],
        sans: ['"Noto Sans"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['clamp(2.5rem, 6vw, 4.25rem)', { lineHeight: '1.08', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(1.875rem, 4vw, 2.75rem)', { lineHeight: '1.18', letterSpacing: '-0.02em' }],
        eyebrow: ['0.75rem', { lineHeight: '1', letterSpacing: '0.2em' }],
      },
      borderRadius: { xl: '0.875rem', '2xl': '1.25rem', '3xl': '1.75rem' },
      boxShadow: {
        card: '0 1px 3px rgba(11, 18, 32, 0.03), 0 8px 24px -12px rgba(11, 18, 32, 0.08)',
        lift: '0 4px 12px rgba(11, 18, 32, 0.05), 0 20px 40px -16px rgba(11, 18, 32, 0.15)',
        gold: '0 0 0 1px rgba(190, 155, 75, 0.25), 0 8px 24px -12px rgba(190, 155, 75, 0.15)',
      },
      keyframes: {
        rise: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'none' } },
        pulseSlow: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.75' } },
      },
      animation: {
        rise: 'rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        pulseSlow: 'pulseSlow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
