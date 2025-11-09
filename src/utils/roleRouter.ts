/**
 * Helper function untuk routing berdasarkan role
 */

export const getRoleRoute = (role: string): string => {
  switch (role) {
    case "pelanggan":
      return "/(pelanggan)";
    case "bengkel":
      return "/(bengkel)";
    case "montir":
      return "/(montir)";
    default:
      return "/(tabs)";
  }
};
