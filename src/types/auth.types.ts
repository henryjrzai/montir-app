/**
 * Type definitions untuk Auth
 * Berdasarkan API specification
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nama: string;
  alamat: string;
  email: string;
  password: string;
  password_confirmation: string;
  no_telp: string;
  role: "pelanggan" | "bengkel";
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface Bengkel {
  id: number;
  user_id: number;
  nama: string;
  alamat: string;
  latitude: string;
  longitude: string;
  verifikasi: number; // 0 = belum verifikasi, 1 = terverifikasi
  alasan_penolakan: string | null;
  foto: string | null;
  created_at: string;
  updated_at: string;
}

export interface Montir {
  id: number;
  bengkel_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  bengkel: Bengkel;
}

export interface User {
  id: number;
  nama: string;
  alamat: string;
  email: string;
  no_telp: string;
  role: string;
  foto?: string | null;
  bengkel?: Bengkel; // Data bengkel jika role = bengkel atau montir
  montir?: Montir; // Data montir jika role = montir
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  status: boolean;
  message: string;
  data: User;
  token?: string;
}

export interface ApiError {
  status: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
