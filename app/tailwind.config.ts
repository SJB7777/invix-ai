import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      colors: {
        // UI 기본 색상
        primary: {
          DEFAULT: "#3182f6",
          foreground: "#ffffff",
        },
        background: "#f2f4f6",
        surface: "#ffffff",
        border: "#e2e8f0",
        input: "#e2e8f0",
        ring: "#3182f6",
        
        // 데이터 시각화 전용 색상 (그래프용)
        data: {
          measured: "#0d9488", // Teal
          calculated: "#f97316", // Orange
          residual: "#ef4444", // Red
        },
      },
      // Bento UI용 그림자 설정
      boxShadow: {
        'bento': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'bento-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;