/**
 * Pelanggan Types
 */

// Bengkel Search Types
export interface BengkelSearchRequest {
  latitude: number;
  longitude: number;
  jenis_layanan: string;
}

export interface BengkelSearchItem {
  id: number;
  nama: string;
  alamat: string;
  latitude: string;
  longitude: string;
  foto: string;
  jarak: string;
  jarak_meter: number;
  layanan: string[];
}

export interface BengkelSearchResponse {
  status: boolean;
  message: string;
  data: BengkelSearchItem[];
  total: number;
}

// Order History Types
export interface BengkelInfo {
  id: number;
  user_id: number;
  nama: string;
  alamat: string;
  latitude: string;
  longitude: string;
  verifikasi: number;
  alasan_penolakan: string | null;
  foto: string;
  created_at: string;
  updated_at: string;
}

export interface LayananBengkelDetail {
  id: number;
  bengkel_id: number;
  jenis_layanan: string;
  created_at: string;
  updated_at: string;
  bengkel: BengkelInfo;
}

export interface OrderHistoryItem {
  id: number;
  montir_id: number | null;
  layanan_bengkel_id: number;
  pelanggan_id: number;
  latitude: string;
  longitude: string;
  status: "menunggu" | "kelokasi" | "kerjakan" | "selesai" | "batal";
  harga_layanan: string | null;
  status_pembayaran: string;
  bukti_bayar: string | null;
  created_at: string;
  updated_at: string;
  layanan_bengkel: LayananBengkelDetail;
}

export interface OrderHistoryResponse {
  status: string;
  data: OrderHistoryItem[];
}

// Order Detail Types
export interface UserInfo {
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

export interface MontirDetail {
  id: number;
  bengkel_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  user: UserInfo;
  bengkel: BengkelInfo;
}

export interface LayananBengkel {
  id: number;
  bengkel_id: number;
  jenis_layanan: string;
  created_at: string;
  updated_at: string;
}

export interface ItemService {
  id: number;
  order_layanan_id: number;
  nama_item: string;
  harga: number;
  created_at: string;
  updated_at: string;
}

export interface OrderDetail {
  id: number;
  montir_id: number | null;
  layanan_bengkel_id: number;
  pelanggan_id: number;
  latitude: string;
  longitude: string;
  status: "menunggu" | "kelokasi" | "kerjakan" | "selesai" | "batal";
  harga_layanan: number | null;
  status_pembayaran: string;
  bukti_bayar: string | null;
  created_at: string;
  updated_at: string;
  pelanggan: UserInfo;
  montir: MontirDetail | null;
  layanan_bengkel: LayananBengkel;
  item_service: ItemService[];
}

export interface OrderDetailResponse {
  status: string;
  data: OrderDetail;
}

// Bengkel Detail Types
export interface BengkelDetailInfo {
  id: number;
  nama: string;
  alamat: string;
  latitude: string;
  longitude: string;
  foto: string;
}

export interface LayananBengkelItem {
  id: number;
  bengkel_id: number;
  jenis_layanan: string;
  created_at: string;
  updated_at: string;
}

export interface BengkelDetailData {
  bengkel: BengkelDetailInfo;
  layanan: LayananBengkelItem[];
}

export interface BengkelDetailResponse {
  status: boolean;
  message: string;
  data: BengkelDetailData;
}

// Create Order Types
export interface CreateOrderRequest {
  layanan_bengkel_id: number;
  latitude: number;
  longitude: number;
}

export interface CreateOrderData {
  id: number;
  layanan_bengkel_id: number;
  pelanggan_id: number;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderResponse {
  status: string;
  message: string;
  data: CreateOrderData;
}

export interface ProfileUser {
  id: number;
  nama: string;
  alamat: string;
  no_telp: string;
  email: string;
  role: string;
  foto: string | null;
  created_at: string;
  updated_at: string;
  bengkel: any | null;
  montir: any[];
}

export interface ProfileResponse {
  status: boolean;
  message: string;
  data: {
    user: ProfileUser;
  };
}
