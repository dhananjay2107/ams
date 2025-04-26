import type { Config } from "tailwindcss";
const { heroui } = require("@heroui/react");


export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#172554',
        secondary: '#6366f1',
        yellow: "#fef08a",
      },
    },
  },
  plugins: [heroui()],
} satisfies Config;
