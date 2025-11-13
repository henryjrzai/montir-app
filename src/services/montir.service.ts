/**
 * Montir Service
 * Handle montir bengkel operations
 */

import { API_ENDPOINTS } from "../config/api";
import {
  CreateMontirRequest,
  CreateMontirResponse,
  DeleteMontirResponse,
  ListMontirResponse,
  MontirOrderListResponse,
} from "../types/montir.types";
import { httpService } from "./http.service";

export const montirService = {
  /**
   * Get list of montir bengkel
   */
  async getMontirList(): Promise<ListMontirResponse> {
    const response = await httpService.get<ListMontirResponse>(
      API_ENDPOINTS.LIST_MONTIR_BENGKEL
    );
    return response;
  },

  /**
   * Create new montir
   */
  async createMontir(data: CreateMontirRequest): Promise<CreateMontirResponse> {
    const response = await httpService.post<CreateMontirResponse>(
      API_ENDPOINTS.CREATE_MONTIR_BENGKEL,
      data
    );
    return response;
  },

  /**
   * Delete montir
   */
  async deleteMontir(id: number): Promise<DeleteMontirResponse> {
    const response = await httpService.delete<DeleteMontirResponse>(
      `${API_ENDPOINTS.DELETE_MONTIR_BENGKEL}/${id}`
    );
    return response;
  },

  /**
   * Get list order layanan untuk montir
   * GET /montir/order-layanan/{montirId}
   */
  async getMontirOrderList(montirId: number): Promise<MontirOrderListResponse> {
    try {
      console.log("[MontirService] Fetching montir orders:", montirId);

      const response = await httpService.get<MontirOrderListResponse>(
        `${API_ENDPOINTS.MONTIR_ORDER_LIST}/${montirId}`
      );

      console.log("[MontirService] Montir orders fetched:", {
        count: response.data?.length || 0,
      });

      return response;
    } catch (error: any) {
      console.error("[MontirService] Failed to fetch montir orders:", error);
      throw error;
    }
  },
};
