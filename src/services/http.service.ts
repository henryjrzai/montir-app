/**
 * HTTP Service menggunakan Axios
 * Dengan interceptor untuk token dan error handling
 */

import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { API_CONFIG } from "../config/api";
import { ApiError } from "../types/auth.types";
import { StorageService } from "./storage.service";

class HttpService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request Interceptor - menambahkan token ke header
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await StorageService.getToken();

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request untuk debugging
        console.log(
          `[HTTP Request] ${config.method?.toUpperCase()} ${config.url}`
        );

        return config;
      },
      (error) => {
        console.error("[HTTP Request Error]", error);
        return Promise.reject(error);
      }
    );

    // Response Interceptor - handle error globally
    this.client.interceptors.response.use(
      (response) => {
        console.log(
          `[HTTP Response] ${response.status} ${response.config.url}`
        );
        return response;
      },
      async (error: AxiosError<ApiError>) => {
        console.error(
          "[HTTP Response Error]",
          error.response?.status,
          error.config?.url
        );

        // Handle 401 Unauthorized - token expired atau invalid
        if (error.response?.status === 401) {
          console.log("[HTTP] Unauthorized - clearing auth data");
          await StorageService.clearAll();
          // TODO: Redirect to login screen
        }

        // Format error untuk konsistensi
        const apiError: ApiError = {
          status: false,
          message:
            error.response?.data?.message ||
            error.message ||
            "Terjadi kesalahan",
          errors: error.response?.data?.errors,
        };

        return Promise.reject(apiError);
      }
    );
  }

  // HTTP Methods
  async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  // Get raw axios instance jika perlu custom config
  getClient(): AxiosInstance {
    return this.client;
  }
}

// Export singleton instance
export const httpService = new HttpService();
