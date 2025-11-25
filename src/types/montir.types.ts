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

// Montir Order Types
export interface MontirOrderPelanggan {
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

export interface MontirOrderBengkel {
  id: number;
  user_id: number;
  nama: string;
  alamat: string;
  latitude: string;
  longitude: string;
  verifikasi: number;
  alasan_penolakan: string | null;
  foto: string | null;
  created_at: string;
  updated_at: string;
}

export interface MontirOrderLayananBengkel {
  id: number;
  bengkel_id: number;
  jenis_layanan: string;
  created_at: string;
  updated_at: string;
  bengkel: MontirOrderBengkel;
}

export interface MontirOrderItemService {
  id: number;
  order_layanan_id: number;
  nama_item: string;
  harga: number;
  created_at: string;
  updated_at: string;
}

export interface MontirOrderUlasan {
  id: number;
  order_layanan_id: number;
  pelanggan_id: number;
  bengkel_id: number;
  rating: number;
  ulasan: string;
  created_at: string;
  updated_at: string;
}

export interface MontirOrder {
  id: number;
  montir_id: number;
  kode_order: string;
  layanan_bengkel_id: number;
  pelanggan_id: number;
  latitude: string;
  longitude: string;
  status: "menunggu" | "kelokasi" | "kerjakan" | "pembayaran" | "selesai" | "batal";
  harga_layanan: number;
  status_pembayaran: "belum_lunas" | "lunas";
  bukti_bayar: string | null;
  created_at: string;
  updated_at: string;
  pelanggan: MontirOrderPelanggan;
  layanan_bengkel: MontirOrderLayananBengkel;
  item_service: MontirOrderItemService[];
  ulasan_rating?: MontirOrderUlasan;
}

export interface MontirOrderListResponse {
  status: boolean;
  message: string;
  data: MontirOrder[];
  total: number;
}
