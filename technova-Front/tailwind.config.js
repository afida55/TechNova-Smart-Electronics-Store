/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1A1A2E",
          light: "#2A2A4A",
        },
        electric: {
          DEFAULT: "#2D3E8C",
          soft: "#EEF2F9",
        },
        signal: {
          DEFAULT: "#C9A96E",
          soft: "#F8F4EC",
        },
        gold: {
          DEFAULT: "#C9A96E",
          soft: "#F8F4EC",
        },
        surface: "#FFFFFF",
        base: "#F8F9FA",
        ink: "#1E293B",
        muted: "#64748B",
        border: "#E5E7EB",
      },
      boxShadow: {
        premium: "0 2px 12px rgba(0,0,0,0.04)",
        "premium-lg": "0 8px 30px rgba(0,0,0,0.06)",
        "premium-xl": "0 12px 40px rgba(0,0,0,0.08)",
      },
      borderRadius: {
        premium: "12px",
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}