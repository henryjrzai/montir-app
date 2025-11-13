/**
 * API Configuration
 * Base URL diambil dari spesifikasi API
 */

export const API_CONFIG = {
  BASE_URL: "https://montir.tempakodedevelopment.my.id/api",
  TIMEOUT: 30000, // 30 seconds
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/login",
  REGISTER: "/register",

  // Profile
  GET_PROFILE: "/profil",
  UPDATE_PROFILE: "/profil/update",
  UPDATE_PHOTO: "/profil/update/foto",
  CHANGE_PASSWORD: "/profil/update/password",

  // Montir
  ADD_MONTIR: "/montir/add",
  DELETE_MONTIR: "/montir/delete",
  LIST_MONTIR: "/montir/list",

  // Bengkel
  LIST_MONTIR_BENGKEL: "/bengkel-management/montir/daftar-montir",
  CREATE_MONTIR_BENGKEL: "/bengkel-management/montir/tambah-montir",
  DELETE_MONTIR_BENGKEL: "/bengkel-management/montir/hapus-montir",
  CREATE_BENGKEL: "/bengkel-management/simpan-data-bengkel",
  CHECK_STATUS: "/bengkel-management/cek-validasi",
  LIST_ORDER_BENGKEL: "/bengkel-management/order-layanan/list-order-bengkel",
  DETAIL_ORDER_BENGKEL: "/order-layanan/detail-order",
  ASSIGN_MONTIR: "/bengkel-management/order-layanan/assign-montir",
  LIST_LAYANAN_BENGKEL: "/bengkel-management/layanan-bengkel",
  CREATE_LAYANAN_BENGKEL: "/bengkel-management/daftar-layanan",
  UPDATE_LAYANAN_BENGKEL: "/bengkel-management/update-layanan",
  DELETE_LAYANAN_BENGKEL: "/bengkel-management/hapus-layanan",

  // Services
  ADD_SERVICE: "/services/add",
  UPDATE_SERVICE: "/services/update",
  DELETE_SERVICE: "/services/delete",
  LIST_SERVICES: "/services/list",
  FIND_NEAREST: "/services/find",
  DETAIL_REPAIRSHOP: "/services/repairshop/detail",

  // Orders
  LIST_ORDERS: "/order/list",
  MONTIR_TO_LOCATION: "/order/montir/kelokasi",
  MONTIR_WORKING: "/order/montir/mengerjakan",
  ORDER_HISTORY: "/order-layanan/order-history",
  ORDER_DETAIL: "/order-layanan/detail-order",

  // Pelanggan
  CARI_BENGKEL: "/public/cari-bengkel",
  DETAIL_BENGKEL: "/public/detail-bengkel",
  BUAT_ORDER: "/order-layanan/buat-order",
} as const;
