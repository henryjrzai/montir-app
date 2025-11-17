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
  UpdateSelesaiRequest,
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

  /**
   * Update order status to "kelokasi"
   * PUT /bengkel-management/order-layanan/update/kelokasi/{orderId}
   */
  async updateStatusToKeLokasi(
    orderId: number
  ): Promise<AssignMontirResponse> {
    try {
      const url = `${API_ENDPOINTS.UPDATE_ORDER_STATUS_KELOKASI}/${orderId}`;
      console.log("[OrderService] Updating status to 'kelokasi':", {
        orderId,
        fullUrl: url,
      });

      const response = await httpService.put<AssignMontirResponse>(url, {});

      console.log("[OrderService] Status updated to 'kelokasi' successfully");

      return response;
    } catch (error: any) {
      console.error(
        "[OrderService] Failed to update status to 'kelokasi':",
        error
      );
      throw error;
    }
  },

  /**
   * Update order status to "kerjakan"
   * PUT /bengkel-management/order-layanan/update/kerjakan/{orderId}
   */
  async updateStatusToKerjakan(
    orderId: number
  ): Promise<AssignMontirResponse> {
    try {
      const url = `${API_ENDPOINTS.UPDATE_ORDER_STATUS_KERJAKAN}/${orderId}`;
      console.log("[OrderService] Updating status to 'kerjakan':", {
        orderId,
        fullUrl: url,
      });

      const response = await httpService.put<AssignMontirResponse>(url, {});

      console.log("[OrderService] Status updated to 'kerjakan' successfully");

      return response;
    } catch (error: any) {
      console.error(
        "[OrderService] Failed to update status to 'kerjakan':",
        error
      );
      throw error;
    }
  },

  /**
   * Update order status to "selesai"
   * PUT /bengkel-management/order-layanan/update/selesai/{orderId}
   */
  async updateStatusToSelesai(
    orderId: number,
    data: UpdateSelesaiRequest
  ): Promise<AssignMontirResponse> {
    try {
      const url = `${API_ENDPOINTS.UPDATE_ORDER_STATUS_SELESAI}/${orderId}`;
      console.log("[OrderService] Updating status to 'selesai':", {
        orderId,
        fullUrl: url,
        payload: data,
      });

      const response = await httpService.put<AssignMontirResponse>(url, data);

      console.log("[OrderService] Status updated to 'selesai' successfully");

      return response;
    } catch (error: any) {
      console.error(
        "[OrderService] Failed to update status to 'selesai':",
        error
      );
      throw error;
    }
  },
};
