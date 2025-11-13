/**
 * Pelanggan Service
 * Handle pelanggan operations
 */

import { API_ENDPOINTS } from "../config/api";
import {
  BengkelDetailResponse,
  BengkelSearchRequest,
  BengkelSearchResponse,
  OrderDetailResponse,
  OrderHistoryResponse,
} from "../types/pelanggan.types";
import { httpService } from "./http.service";

export const pelangganService = {
  /**
   * Search nearby bengkel by service type
   */
  async cariBengkel(
    data: BengkelSearchRequest
  ): Promise<BengkelSearchResponse> {
    const response = await httpService.post<BengkelSearchResponse>(
      API_ENDPOINTS.CARI_BENGKEL,
      data
    );
    return response;
  },

  /**
   * Get order history for pelanggan
   */
  async getOrderHistory(): Promise<OrderHistoryResponse> {
    const response = await httpService.get<OrderHistoryResponse>(
      API_ENDPOINTS.ORDER_HISTORY
    );
    return response;
  },

  /**
   * Get order detail by ID
   */
  async getOrderDetail(orderId: number): Promise<OrderDetailResponse> {
    const response = await httpService.get<OrderDetailResponse>(
      `${API_ENDPOINTS.ORDER_DETAIL}/${orderId}`
    );
    return response;
  },

  /**
   * Get bengkel detail by ID
   */
  async getBengkelDetail(bengkelId: number): Promise<BengkelDetailResponse> {
    const response = await httpService.get<BengkelDetailResponse>(
      `${API_ENDPOINTS.DETAIL_BENGKEL}/${bengkelId}`
    );
    return response;
  },
};
