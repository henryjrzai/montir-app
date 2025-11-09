/**
 * Layanan Service
 * Handle layanan bengkel operations
 */

import { API_ENDPOINTS } from "../config/api";
import {
  CreateLayananRequest,
  CreateLayananResponse,
  DeleteLayananResponse,
  ListLayananResponse,
  UpdateLayananRequest,
  UpdateLayananResponse,
} from "../types/layanan.types";
import { httpService } from "./http.service";

export const layananService = {
  /**
   * Get list of layanan bengkel
   */
  async getLayananList(): Promise<ListLayananResponse> {
    const response = await httpService.get<ListLayananResponse>(
      API_ENDPOINTS.LIST_LAYANAN_BENGKEL
    );
    return response;
  },

  /**
   * Create new layanan bengkel (batch)
   */
  async createLayanan(jenisLayanan: string[]): Promise<CreateLayananResponse> {
    const payload: CreateLayananRequest = {
      jenis_layanan: jenisLayanan,
    };
    const response = await httpService.post<CreateLayananResponse>(
      API_ENDPOINTS.CREATE_LAYANAN_BENGKEL,
      payload
    );
    return response;
  },

  /**
   * Update existing layanan
   */
  async updateLayanan(
    id: number,
    jenisLayanan: string
  ): Promise<UpdateLayananResponse> {
    const payload: UpdateLayananRequest = {
      jenis_layanan: jenisLayanan,
    };
    const response = await httpService.put<UpdateLayananResponse>(
      `${API_ENDPOINTS.UPDATE_LAYANAN_BENGKEL}/${id}`,
      payload
    );
    return response;
  },

  /**
   * Delete layanan
   */
  async deleteLayanan(id: number): Promise<DeleteLayananResponse> {
    const response = await httpService.delete<DeleteLayananResponse>(
      `${API_ENDPOINTS.DELETE_LAYANAN_BENGKEL}/${id}`
    );
    return response;
  },
};
