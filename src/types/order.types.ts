/**
 * Type definitions untuk Order Management
 */

export interface Pelanggan {
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

export interface LayananBengkel {
  id: number;
  bengkel_id: number;
  jenis_layanan: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  montir_id: number | null;
  layanan_bengkel_id: number;
  pelanggan_id: number;
  latitude: string;
  longitude: string;
  status: "menunggu" | "kelokasi" | "kerjakan" | "selesai" | "batal";
  harga_layanan: number | null;
  status_pembayaran: "belum-lunas" | "lunas";
  bukti_bayar: string | null;
  created_at: string;
  updated_at: string;
  pelanggan: Pelanggan;
  layanan_bengkel: LayananBengkel;
}

export interface ListOrderResponse {
  status: string;
  data: Order[];
}

export interface User {
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

export interface Bengkel {
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

export interface MontirDetail {
  id: number;
  bengkel_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  user: User;
  bengkel: Bengkel;
}

export interface ItemService {
  id: number;
  order_layanan_id: number;
  nama_item: string;
  harga: number;
  created_at: string;
  updated_at: string;
}

export interface OrderDetail extends Order {
  montir?: MontirDetail | null;
  item_service: ItemService[];
}

export interface DetailOrderResponse {
  status: string;
  data: OrderDetail;
}

export interface AssignMontirRequest {
  montir_id: number;
}

export interface AssignMontirResponse {
  status: string;
  message: string;
  data: OrderDetail;
}
