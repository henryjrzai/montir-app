/**
 * Layanan Types
 */

export interface LayananBengkelItem {
  id: number;
  bengkel_id: number;
  jenis_layanan: string;
  created_at: string;
  updated_at: string;
}

export interface ListLayananResponse {
  status: boolean;
  message: string;
  data: LayananBengkelItem[];
}

export interface CreateLayananRequest {
  jenis_layanan: string[];
}

export interface BengkelInfo {
  id: number;
  nama: string;
  alamat: string;
  latitude: string;
  longitude: string;
  foto: string;
}

export interface CreateLayananResponse {
  status: boolean;
  message: string;
  data: {
    bengkel: BengkelInfo;
    layanan: LayananBengkelItem[];
  };
}

export interface UpdateLayananRequest {
  jenis_layanan: string;
}

export interface UpdateLayananResponse {
  status: boolean;
  message: string;
  data: LayananBengkelItem;
}

export interface DeleteLayananResponse {
  status: boolean;
  message: string;
}
