import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },

      screens: {
        'sm': {"max":"600px"},
        'md': {"max":"1024px"},
        'md2': {"max":"1216px", "min": "1025px"},
        'lg' : {"min": "1025px"}
        // 'md': '768px', // Medium devices
        // 'lg': '1024px', // Large devices
        // You can continue adding sizes:
        // 'xl': '1280px',
        // '2xl': '1536px',
      },
    },
  },
  plugins: [],
};
export default config;
