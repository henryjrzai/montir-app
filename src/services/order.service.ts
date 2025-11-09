/**
 * Order Service
 * Handle order management operations
 */

import { API_ENDPOINTS } from "../config/api";
import { ListOrderResponse } from "../types/order.types";
import { httpService } from "./http.service";

export const OrderService = {
  /**
   * Get list order untuk bengkel
   * GET /bengkel-management/order-layanan/list-order-bengkel
   */
  async getOrderList(): Promise<ListOrderResponse> {
    try {
      console.log("[OrderService] Fetching order list...");

      const response = await httpService.get<ListOrderResponse>(
        API_ENDPOINTS.LIST_ORDER_BENGKEL
      );

      console.log("[OrderService] Order list fetched:", {
        count: response.data?.length || 0,
      });

      return response;
    } catch (error: any) {
      console.error("[OrderService] Failed to fetch orders:", error);
      throw error;
    }
  },
};
