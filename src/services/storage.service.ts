/**
 * Storage Service menggunakan AsyncStorage
 * Untuk menyimpan token dan data user
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types/auth.types";

const STORAGE_KEYS = {
  TOKEN: "@montir_app:token",
  USER: "@montir_app:user",
} as const;

export const StorageService = {
  // Token Management
  async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } catch (error) {
      console.error("Error saving token:", error);
      throw error;
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  },

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error("Error removing token:", error);
      throw error;
    }
  },

  // User Data Management
  async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error("Error saving user:", error);
      throw error;
    }
  },

  async getUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  },

  async removeUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      console.error("Error removing user:", error);
      throw error;
    }
  },

  // Clear All Data
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
    } catch (error) {
      console.error("Error clearing storage:", error);
      throw error;
    }
  },
};
