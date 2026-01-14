/**
 * Auth Service
 * Handle login, register, dan operasi auth lainnya
 */

import { API_ENDPOINTS } from "../config/api";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
  User,
} from "../types/auth.types";
import { httpService } from "./http.service";
import { StorageService } from "./storage.service";

export const AuthService = {
  /**
   * Login user
   * POST /login
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await httpService.post<AuthResponse>(
      API_ENDPOINTS.LOGIN,
      credentials
    );

    // Simpan token dan user data setelah login berhasil
    if (response.status && response.data) {
      // Token ada di level root response
      if (response.token) {
        await StorageService.saveToken(response.token);
      }
      // Data langsung adalah user object
      await StorageService.saveUser(response.data);
    }

    return response;
  },

  /**
   * Register user baru
   * POST /register
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await httpService.post<AuthResponse>(
      API_ENDPOINTS.REGISTER,
      userData
    );

    // Simpan token dan user data setelah register berhasil
    if (response.status && response.data) {
      // Token ada di level root response
      if (response.token) {
        await StorageService.saveToken(response.token);
      }
      // Data langsung adalah user object
      await StorageService.saveUser(response.data);
    }

    return response;
  },

  /**
   * Logout user
   * Clear token dan user data dari storage
   */
  async logout(): Promise<void> {
    await StorageService.clearAll();
  },

  /**
   * Get current user dari storage
   */
  async getCurrentUser(): Promise<User | null> {
    return await StorageService.getUser();
  },

  /**
   * Get current token dari storage
   */
  async getToken(): Promise<string | null> {
    return await StorageService.getToken();
  },

  /**
   * Check apakah user sudah login (ada token)
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await StorageService.getToken();
    return !!token;
  },

  /**
   * Get profile dari server
   * GET /profil
   */
  async getProfile(): Promise<{ success: boolean; data: User }> {
    const response = await httpService.get<{ success: boolean; data: User }>(
      API_ENDPOINTS.GET_PROFILE
    );

    // Update user data di storage
    if (response.success && response.data) {
      await StorageService.saveUser(response.data);
    }

    return response;
  },

  /**
   * Request reset password
   * POST /reset-password-request
   */
  async resetPasswordRequest(
    data: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> {
    const response = await httpService.post<ResetPasswordResponse>(
      API_ENDPOINTS.RESET_PASSWORD_REQUEST,
      data
    );
    return response;
  },
};
