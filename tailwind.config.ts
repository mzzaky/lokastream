import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Aithor Dev Light Mode Colors - Cartoonish Palette
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          card: 'var(--bg-card)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
        },
        accent: {
          pink: 'var(--accent-pink)',
          blue: 'var(--accent-blue)',
          yellow: 'var(--accent-yellow)',
          purple: 'var(--accent-purple)',
          orange: 'var(--accent-orange)',
          green: 'var(--accent-green)',
          red: 'var(--accent-red)',
          cyan: 'var(--accent-cyan)',
        },
        border: {
          DEFAULT: 'var(--border-color)',
        },
        // Keep original candy colors for compatibility
        candy: {
          pink: '#FF6B9D',
          purple: '#A66DD4',
          blue: '#4ECDC4',
          cyan: '#74C0FC',
          yellow: '#FFE66D',
          orange: '#FF8C42',
          green: '#6BCB77',
          red: '#FF6B6B',
        },
        // Pastel Backgrounds
        pastel: {
          pink: '#FFE5D9',
          purple: '#E8D5F2',
          blue: '#D4F1F9',
          mint: '#D5F5E3',
          yellow: '#FFF9E3',
          peach: '#FFE8D6',
        },
        // Dark Cartoonish
        cartoon: {
          dark: '#2D3436',
          darker: '#1A1A2E',
          navy: '#16213E',
        },
      },
      fontFamily: {
        // Aithor Dev Fonts
        display: ['Baloo 2', 'cursive'],
        body: ['Fredoka', 'cursive'],
        hand: ['Patrick Hand', 'cursive'],
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
        '5': '5px',
      },
      borderRadius: {
        'blob': '30% 70% 70% 30% / 30% 30% 70% 70%',
        'cartoon': '20px',
        'bubble': '50px',
        'card': '30px',
      },
      boxShadow: {
        'cartoon': '8px 8px 0 var(--border-color)',
        'cartoon-sm': '4px 4px 0 var(--border-color)',
        'cartoon-lg': '12px 12px 0 var(--border-color)',
        'cartoon-xl': '15px 15px 0 var(--border-color)',
        'cartoon-pink': '8px 8px 0 var(--accent-pink)',
        'cartoon-purple': '8px 8px 0 var(--accent-purple)',
        'cartoon-blue': '8px 8px 0 var(--accent-blue)',
        'cartoon-yellow': '8px 8px 0 var(--accent-yellow)',
        'cartoon-green': '8px 8px 0 var(--accent-green)',
        'cartoon-orange': '8px 8px 0 var(--accent-orange)',
        'glow-pink': '0 0 30px var(--glow-pink)',
        'glow-blue': '0 0 30px var(--glow-blue)',
      },
      animation: {
        'float': 'float 20s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'icon-float': 'iconFloat 6s ease-in-out infinite',
        'icon-bounce': 'iconBounce 4s ease-in-out infinite',
        'icon-spin': 'iconSpin 8s linear infinite',
        'icon-wobble': 'iconWobble 3s ease-in-out infinite',
        'icon-zoom': 'iconZoom 5s ease-in-out infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'blob': 'morphBlob 8s ease-in-out infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'wave': 'wave 1s ease-in-out infinite',
        'avatar-float': 'avatarFloat 4s ease-in-out infinite',
        'sticker-bounce': 'stickerBounce 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'crown-bounce': 'crownBounce 1s ease-in-out infinite',
        'project-float': 'projectFloat 3s ease-in-out infinite',
        'skill-load': 'skillLoad 1.5s ease-out forwards',
        'success-pop': 'successPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'color-shift': 'colorShift 5s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-30px) rotate(5deg)' },
          '50%': { transform: 'translateY(0) rotate(0deg)' },
          '75%': { transform: 'translateY(30px) rotate(-5deg)' },
        },
        iconFloat: {
          '0%, 100%': { transform: 'translateY(0) rotate(-10deg) scale(1)' },
          '25%': { transform: 'translateY(-20px) rotate(5deg) scale(1.1)' },
          '50%': { transform: 'translateY(-10px) rotate(-5deg) scale(1)' },
          '75%': { transform: 'translateY(-25px) rotate(10deg) scale(1.05)' },
        },
        iconBounce: {
          '0%, 100%': { transform: 'translateY(0) scale(1) rotate(0deg)' },
          '20%': { transform: 'translateY(-30px) scale(1.2) rotate(-15deg)' },
          '40%': { transform: 'translateY(-5px) scale(0.9) rotate(10deg)' },
          '60%': { transform: 'translateY(-20px) scale(1.1) rotate(-5deg)' },
          '80%': { transform: 'translateY(-8px) scale(0.95) rotate(5deg)' },
        },
        iconSpin: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '25%': { transform: 'rotate(90deg) scale(1.2)' },
          '50%': { transform: 'rotate(180deg) scale(1)' },
          '75%': { transform: 'rotate(270deg) scale(1.2)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        iconWobble: {
          '0%, 100%': { transform: 'rotate(-5deg) translateX(0)' },
          '25%': { transform: 'rotate(5deg) translateX(10px)' },
          '50%': { transform: 'rotate(-3deg) translateX(-5px)' },
          '75%': { transform: 'rotate(8deg) translateX(8px)' },
        },
        iconZoom: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: '0.15' },
          '50%': { transform: 'scale(1.3) rotate(10deg)', opacity: '0.25' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        morphBlob: {
          '0%, 100%': { borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' },
          '25%': { borderRadius: '58% 42% 75% 25% / 76% 46% 54% 24%' },
          '50%': { borderRadius: '50% 50% 33% 67% / 55% 27% 73% 45%' },
          '75%': { borderRadius: '33% 67% 58% 42% / 63% 68% 32% 37%' },
        },
        sparkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.8)' },
        },
        wave: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(20deg)' },
          '75%': { transform: 'rotate(-20deg)' },
        },
        avatarFloat: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(5deg)' },
        },
        stickerBounce: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
          '50%': { transform: 'scale(1.1) rotate(10deg)' },
        },
        shimmer: {
          '0%': { left: '-100%' },
          '100%': { left: '100%' },
        },
        crownBounce: {
          '0%, 100%': { transform: 'translateY(0) rotate(-5deg)' },
          '50%': { transform: 'translateY(-5px) rotate(5deg)' },
        },
        projectFloat: {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)' },
          '50%': { transform: 'translate(-50%, -60%) scale(1.1)' },
        },
        skillLoad: {
          to: { width: 'var(--progress)' },
        },
        successPop: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        colorShift: {
          '0%, 100%': { filter: 'hue-rotate(0deg)' },
          '50%': { filter: 'hue-rotate(30deg)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 107, 157, 0.7)' },
          '50%': { boxShadow: '0 0 0 15px rgba(255, 107, 157, 0)' },
        },
      },
      backgroundImage: {
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-cartoon': 'linear-gradient(135deg, var(--accent-pink), var(--accent-purple), var(--accent-blue))',
        'gradient-sunset': 'linear-gradient(135deg, #FF6B9D 0%, #FFE66D 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #4ECDC4 0%, #74C0FC 100%)',
        'gradient-candy': 'linear-gradient(135deg, #FF8C42 0%, #A66DD4 100%)',
        'pattern-plus': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FF6B9D' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};

export default config;
