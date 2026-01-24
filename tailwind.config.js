/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stampify Brand Colors
        primary: {
          DEFAULT: '#1F3A5F',
          dark: '#15294A',
          light: '#2A4A7C',
          contrast: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#2FB7B3',
          dark: '#249B98',
          light: '#4DD4D0',
          contrast: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#F4B400',
          dark: '#E0A800',
          light: '#FFD54F',
          contrast: '#1F3A5F',
        },
        // Neutral Base
        neutral: {
          white: '#FFFFFF',
          lightest: '#F5F7FA',
          light: '#E8EBF0',
          medium: '#B0B8C4',
          dark: '#6B7280',
          darkest: '#374151',
          black: '#1F2937',
        },
        // System Feedback
        success: {
          DEFAULT: '#4CAF50',
          dark: '#388E3C',
          light: '#81C784',
        },
        warning: {
          DEFAULT: '#FF9800',
          dark: '#F57C00',
          light: '#FFB74D',
        },
        error: {
          DEFAULT: '#E53935',
          dark: '#C62828',
          light: '#EF5350',
        },
        info: {
          DEFAULT: '#2FB7B3',
          dark: '#249B98',
          light: '#4DD4D0',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1F3A5F 0%, #2A4A7C 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #2FB7B3 0%, #4DD4D0 100%)',
        'gradient-accent': 'linear-gradient(135deg, #F4B400 0%, #FFD54F 100%)',
        'gradient-hero': 'linear-gradient(135deg, #1F3A5F 0%, #2FB7B3 100%)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};