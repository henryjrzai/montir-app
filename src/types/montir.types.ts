/**
 * Montir Types
 */

export interface MontirUser {
  id: number;
  nama: string;
  alamat: string;
  no_telp: string;
  email: string;
  role: string;
  foto: string | null;
  created_at: string;
  updated_at: string;
}

export interface MontirBengkelItem {
  id: number;
  bengkel_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  user: MontirUser;
}

export interface ListMontirResponse {
  status: boolean;
  message: string;
  data: MontirBengkelItem[];
}

export interface CreateMontirRequest {
  nama: string;
  alamat: string;
  no_telp: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface CreateMontirResponse {
  status: boolean;
  message: string;
  data: MontirUser;
}

export interface CreateMontirErrorResponse {
  message: string;
  errors: {
    [key: string]: string[];
  };
}

export interface DeleteMontirResponse {
  status: boolean;
  message: string;
}
