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
  CREATE_BENGKEL: "/bengkel-management/simpan-data-bengkel",
  CHECK_STATUS: "/bengkel/status/validate",

  // Services
  ADD_SERVICE: "/services/add",
  UPDATE_SERVICE: "/services/update",
  DELETE_SERVICE: "/services/delete",
  LIST_SERVICES: "/services/list",
  FIND_NEAREST: "/services/find",
  DETAIL_REPAIRSHOP: "/services/repairshop/detail",

  // Orders
  ASSIGN_MONTIR: "/order/bengkel/assign",
  LIST_ORDERS: "/order/list",
  MONTIR_TO_LOCATION: "/order/montir/kelokasi",
  MONTIR_WORKING: "/order/montir/mengerjakan",
} as const;
