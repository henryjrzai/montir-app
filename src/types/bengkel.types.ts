/**
 * Type definitions untuk Bengkel Management
 */

export interface SetupBengkelRequest {
  nama: string;
  alamat: string;
  latitude: string;
  longitude: string;
  foto: File | Blob | string; // File upload or base64 string
}

export interface SetupBengkelResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    user_id: number;
    nama: string;
    alamat: string;
    latitude: string;
    longitude: string;
    foto: string;
    created_at: string;
    updated_at: string;
  };
}

export interface BengkelData {
  id: number;
  user_id: number;
  nama: string;
  alamat: string;
  latitude: string;
  longitude: string;
  verifikasi: number; // "0" = pending/rejected, "1" = verified
  alasan_penolakan: string | null;
  foto: string;
  created_at: string;
  updated_at: string;
}

export interface CheckStatusResponse {
  status: boolean;
  message: string;
  data: BengkelData;
}
