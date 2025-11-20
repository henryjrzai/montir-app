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
  kode_order: string;
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
  ulasan_rating?: UlasanBengkel | null;
  ulasan_bengkel?: UlasanBengkel | null;
  ulasan_montir?: UlasanMontir | null;
}

export interface OrderDetailResponse {
  status: string;
  data: OrderDetail;
}

// Berikan Ulasan Types
export interface BerikanUlasanRequest {
  rating: number;
  ulasan?: string;
  rating_montir: number;
  ulasan_montir?: string;
}

export interface UlasanBengkel {
  id: number;
  pelanggan_id: number;
  bengkel_id: number;
  order_layanan_id: number;
  rating: number;
  ulasan: string | null;
}

export interface UlasanMontir {
  id: number;
  pelanggan_id: number;
  montir_id: number;
  order_layanan_id: number;
  rating: number;
  ulasan: string | null;
}

export interface BerikanUlasanResponse {
  status: boolean;
  message: string;
  data: {
    bengkel: UlasanBengkel;
    montir: UlasanMontir;
  };
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
    bengkel?: any | null;
  };
}

export interface UpdateProfileRequest {
  nama: string;
  alamat: string;
  no_telp: string;
  email: string;
}

export interface UpdateProfileResponse {
  status: boolean;
  message: string;
  data: ProfileUser;
}

export interface ChangePasswordRequest {
  password_lama: string;
  password_baru: string;
  password_baru_confirmation: string;
}

export interface ChangePasswordResponse {
  status: boolean;
  message: string;
  errors?: {
    password_baru?: string[];
    password_lama?: string[];
  };
}
