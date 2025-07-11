/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "inherit",
            a: {
              color: "inherit",
              textDecoration: "underline",
              fontWeight: "500",
            },
            '[class~="lead"]': {
              color: "inherit",
            },
            strong: {
              color: "inherit",
            },
            'ol[type="A"]': {
              "--list-counter-style": "upper-alpha",
            },
            'ol[type="a"]': {
              "--list-counter-style": "lower-alpha",
            },
            'ol[type="A" s]': {
              "--list-counter-style": "upper-alpha",
            },
            'ol[type="a" s]': {
              "--list-counter-style": "lower-alpha",
            },
            'ol[type="I"]': {
              "--list-counter-style": "upper-roman",
            },
            'ol[type="i"]': {
              "--list-counter-style": "lower-roman",
            },
            'ol[type="I" s]': {
              "--list-counter-style": "upper-roman",
            },
            'ol[type="i" s]': {
              "--list-counter-style": "lower-roman",
            },
            'ol[type="1"]': {
              "--list-counter-style": "decimal",
            },
            "ol > li": {
              position: "relative",
            },
            "ol > li::before": {
              content:
                'counter(list-item, var(--list-counter-style, decimal)) "."',
              position: "absolute",
              fontWeight: "400",
              color: "inherit",
            },
            "ul > li": {
              position: "relative",
            },
            "ul > li::before": {
              content: '""',
              position: "absolute",
              backgroundColor: "currentColor",
              borderRadius: "50%",
            },
            hr: {
              borderColor: "inherit",
              borderTopWidth: "1px",
            },
            blockquote: {
              fontWeight: "500",
              fontStyle: "italic",
              color: "inherit",
              borderLeftWidth: "0.25rem",
              borderLeftColor: "inherit",
              quotes: '"\\201C""\\201D""\\2018""\\2019"',
            },
            h1: {
              color: "inherit",
              fontWeight: "800",
            },
            h2: {
              color: "inherit",
              fontWeight: "700",
            },
            h3: {
              color: "inherit",
              fontWeight: "600",
            },
            h4: {
              color: "inherit",
              fontWeight: "600",
            },
            code: {
              color: "inherit",
              fontWeight: "600",
            },
            "code::before": {
              content: '"`"',
            },
            "code::after": {
              content: '"`"',
            },
            "a code": {
              color: "inherit",
            },
            pre: {
              color: "inherit",
              backgroundColor: "inherit",
            },
            thead: {
              color: "inherit",
              fontWeight: "600",
              borderBottomWidth: "1px",
              borderBottomColor: "inherit",
            },
            "tbody tr": {
              borderBottomWidth: "1px",
              borderBottomColor: "inherit",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
