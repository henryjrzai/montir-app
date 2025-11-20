import { httpService } from "./http.service";

/**
 * Interface for the payment request
 */
export interface CreateTransactionRequest {
  kode_order: string;
}

/**
 * Interface for the successful payment response
 */
export interface CreateTransactionResponse {
  status: boolean;
  message: string;
  data: {
    snap_token: string;
  };
}

/**
 * Payment Service
 * Handles payment operations with the backend
 */
export const paymentService = {
  /**
   * Create a new payment transaction on the backend
   * @param data - The request data containing the order code
   * @returns The response containing the Midtrans snap_token
   */
  async createTransaction(
    data: CreateTransactionRequest
  ): Promise<CreateTransactionResponse> {
    // The endpoint is not defined in API_ENDPOINTS, so we use the path directly
    const response = await httpService.post<CreateTransactionResponse>(
      "/payment/create",
      data
    );
    return response;
  },
};
