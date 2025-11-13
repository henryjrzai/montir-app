/**
 * Order Service
 * Handle order management operations
 */

import { API_ENDPOINTS } from "../config/api";
import {
  AssignMontirRequest,
  AssignMontirResponse,
  DetailOrderResponse,
  ListOrderResponse,
} from "../types/order.types";
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

  /**
   * Get detail order
   * GET /bengkel-management/order-layanan/detail-order/{orderId}
   */
  async getOrderDetail(orderId: number): Promise<DetailOrderResponse> {
    try {
      console.log("[OrderService] Fetching order detail:", orderId);

      const response = await httpService.get<DetailOrderResponse>(
        `${API_ENDPOINTS.DETAIL_ORDER_BENGKEL}/${orderId}`
      );

      console.log("[OrderService] Order detail fetched:", {
        orderId: response.data?.id,
        status: response.data?.status,
      });

      return response;
    } catch (error: any) {
      console.error("[OrderService] Failed to fetch order detail:", error);
      throw error;
    }
  },

  /**
   * Assign montir to order
   * PUT /bengkel-management/order-layanan/assign-montir/{orderId}
   * Body: { montir_id: number }
   */
  async assignMontir(
    orderId: number,
    data: AssignMontirRequest
  ): Promise<AssignMontirResponse> {
    try {
      const url = `${API_ENDPOINTS.ASSIGN_MONTIR}/${orderId}`;
      console.log("[OrderService] Assigning montir to order:", {
        orderId,
        montirId: data.montir_id,
        endpoint: API_ENDPOINTS.ASSIGN_MONTIR,
        fullUrl: url,
        requestBody: data,
      });

      const response = await httpService.put<AssignMontirResponse>(url, data);

      console.log("[OrderService] Montir assigned successfully");

      return response;
    } catch (error: any) {
      console.error("[OrderService] Failed to assign montir:", error);
      throw error;
    }
  },
};
