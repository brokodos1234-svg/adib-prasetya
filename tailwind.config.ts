import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "#eef0f4",
        card: "#ffffff",
        soft: "#f5f6f8",
        border: "#e6e8ec",
        strong: "#0f172a",
        body: "#334155",
        muted: "#64748b",
        faint: "#94a3b8",
        accent: {
          DEFAULT: "#0d9488",
          soft: "#e6f6f4",
          dark: "#0b7a70",
        },
        blackbtn: "#111318",
        danger: {
          DEFAULT: "#e11d48",
          soft: "#fde2df",
        },
        warning: {
          DEFAULT: "#d97706",
          soft: "#fef1da",
        },
        info: {
          DEFAULT: "#2563eb",
          soft: "#e6effe",
        },
        success: {
          DEFAULT: "#0d9488",
          soft: "#e1f4f1",
        },
        sidebar: "#12141a",
        sidebarSoft: "#1c1f27",
      },
      borderRadius: {
        lg2: "20px",
        md2: "14px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,.04), 0 1px 20px rgba(15,23,42,.03)",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
