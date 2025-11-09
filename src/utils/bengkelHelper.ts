/**
 * Helper functions untuk Bengkel
 */

import { User } from "../types/auth.types";

export interface BengkelStatus {
  hasData: boolean;
  isVerified: boolean;
  message: string;
  type: "success" | "warning" | "error";
}

/**
 * Check status data dan verifikasi bengkel
 */
export const checkBengkelStatus = (user: User | null): BengkelStatus => {
  // User tidak ada atau bukan bengkel
  if (!user || user.role !== "bengkel") {
    return {
      hasData: false,
      isVerified: false,
      message: "",
      type: "success",
    };
  }

  // Belum ada data bengkel
  if (!user.bengkel) {
    return {
      hasData: false,
      isVerified: false,
      message:
        "Anda belum melengkapi data bengkel. Silakan lengkapi data bengkel terlebih dahulu.",
      type: "warning",
    };
  }

  // Sudah ada data tapi belum terverifikasi
  if (user.bengkel.verifikasi === 0) {
    return {
      hasData: true,
      isVerified: false,
      message:
        "Data bengkel Anda sedang dalam proses verifikasi. Mohon tunggu hingga admin memverifikasi.",
      type: "warning",
    };
  }

  // Data lengkap dan sudah terverifikasi
  return {
    hasData: true,
    isVerified: true,
    message: "Bengkel Anda sudah terverifikasi dan siap beroperasi.",
    type: "success",
  };
};

/**
 * Check apakah bengkel sudah bisa operasional (data lengkap & verified)
 */
export const isBengkelOperational = (user: User | null): boolean => {
  if (!user || user.role !== "bengkel" || !user.bengkel) {
    return false;
  }
  return user.bengkel.verifikasi === 1;
};
