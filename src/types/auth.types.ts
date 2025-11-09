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

export interface User {
  id: number; 
  nama: string;
  alamat: string;
  email: string;
  no_telp: string;
  role: string;
  foto?: string | null;
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
