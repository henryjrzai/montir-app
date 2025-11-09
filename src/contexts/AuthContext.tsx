/**
 * Auth Context
 * Global state management untuk authentication
 */

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { AuthService } from "../services/auth.service";
import { ApiError, User } from "../types/auth.types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    nama: string,
    alamat: string,
    email: string,
    password: string,
    password_confirmation: string,
    no_telp: string,
    role: "pelanggan" | "bengkel"
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const token = await AuthService.getToken();
      const savedUser = await AuthService.getCurrentUser();

      if (token && savedUser) {
        setUser(savedUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await AuthService.login({ email, password });

      if (response.status && response.data) {
        // response.data langsung adalah user object
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        throw new Error(response.message || "Login gagal");
      }
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || "Login gagal");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    nama: string,
    alamat: string,
    email: string,
    password: string,
    password_confirmation: string,
    no_telp: string,
    role: "pelanggan" | "bengkel"
  ) => {
    try {
      setIsLoading(true);
      const response = await AuthService.register({
        nama,
        alamat,
        email,
        password,
        password_confirmation,
        no_telp,
        role,
      });

      console.info("Register response:", response);
      console.info("With data:", response.data);

      if (response.status && response.data) {
        // response.data langsung adalah user object
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        throw new Error(response.message || "Registrasi gagal");
      }
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || "Registrasi gagal");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await AuthService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await AuthService.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook untuk menggunakan Auth Context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
