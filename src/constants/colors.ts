/**
 * Color Palette untuk Montir App
 * Primary color: #67ad5b (Green)
 */

export const Colors = {
  // Primary Colors
  primary: "#67ad5b",
  primaryDark: "#4d8a44",
  primaryLight: "#8bc880",

  // Secondary Colors
  secondary: "#2c3e50",
  secondaryLight: "#34495e",

  // Status Colors
  success: "#27ae60",
  error: "#e74c3c",
  warning: "#f39c12",
  info: "#3498db",

  // Neutral Colors
  white: "#ffffff",
  black: "#000000",
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

  // Background
  background: "#ffffff",
  backgroundSecondary: "#f5f5f5",

  // Text
  text: {
    primary: "#1f2937",
    secondary: "#6b7280",
    disabled: "#9ca3af",
    inverse: "#ffffff",
  },

  // Border
  border: "#e5e7eb",
  borderLight: "#f3f4f6",
} as const;
