/**
 * Bengkel Service
 * Handle bengkel management operations
 */

import { API_ENDPOINTS } from "../config/api";
import { SetupBengkelResponse } from "../types/bengkel.types";
import { httpService } from "./http.service";

export const BengkelService = {
  /**
   * Setup/Create data bengkel
   * POST /bengkel-management/simpan-data-bengkel
   *
   * Note: Menggunakan FormData untuk upload foto
   */
  async setupBengkel(
    nama: string,
    alamat: string,
    latitude: string,
    longitude: string,
    foto: any // File atau URI foto
  ): Promise<SetupBengkelResponse> {
    try {
      console.log("[BengkelService] Setup bengkel started", {
        nama,
        alamat,
        latitude,
        longitude,
        hasFoto: !!foto,
      });

      // Buat FormData untuk multipart/form-data
      const formData = new FormData();
      formData.append("nama", nama);
      formData.append("alamat", alamat);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);

      // Handle foto upload - React Native specific format
      if (foto) {
        // Extract filename from URI
        const uriParts = foto.uri.split("/");
        const fileName = foto.fileName || uriParts[uriParts.length - 1];

        // Determine MIME type
        let mimeType = "image/jpeg";
        if (fileName.toLowerCase().endsWith(".png")) {
          mimeType = "image/png";
        } else if (
          fileName.toLowerCase().endsWith(".jpg") ||
          fileName.toLowerCase().endsWith(".jpeg")
        ) {
          mimeType = "image/jpeg";
        }

        // React Native FormData format untuk file
        const photoFile: any = {
          uri: foto.uri,
          type: mimeType,
          name: fileName,
        };

        formData.append("foto", photoFile);

        console.log("[BengkelService] Photo attached:", {
          uri: foto.uri,
          type: mimeType,
          name: fileName,
        });
      }

      console.log(
        "[BengkelService] Sending request to:",
        API_ENDPOINTS.CREATE_BENGKEL
      );

      // Gunakan method khusus untuk FormData
      const response = await httpService.postFormData<SetupBengkelResponse>(
        API_ENDPOINTS.CREATE_BENGKEL,
        formData
      );

      console.log("[BengkelService] Setup bengkel success:", response);
      return response;
    } catch (error: any) {
      console.error("[BengkelService] Setup bengkel failed:", error);
      throw error;
    }
  },

  /**
   * Check status validasi bengkel
   * GET /bengkel/status/validate
   */
  async checkValidationStatus(): Promise<any> {
    const response = await httpService.get<any>(API_ENDPOINTS.CHECK_STATUS);
    return response;
  },
};
