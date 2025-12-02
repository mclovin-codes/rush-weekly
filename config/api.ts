import { API_ROUTES } from "@/constants/api-routes";
import { authClient } from "@/lib/auth-client";
import axios, { AxiosError, AxiosResponse } from "axios";

export const baseURL = process.env.EXPO_PUBLIC_API_URL!;

// ——— Axios instance ———
const api = axios.create({
  baseURL,
  timeout: 10000,
  timeoutErrorMessage: "Request timed out - please check your connection",
  headers: { "Content-Type": "application/json" },
  validateStatus: (status) => status >= 200 && status < 600,
});

// ——— Request interceptor ———
api.interceptors.request.use(
  async (config) => {
    // Get cookies from Better Auth client
    const cookies = authClient.getCookie();
    if (cookies) {
      config.headers = config.headers ?? {};
      config.headers.Cookie = cookies;
    }

    if (__DEV__) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ——— Response interceptor ———
api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (__DEV__) {
      console.log(
        `✅ ${response.config.method?.toUpperCase()} ${response.config.url}`
      );
    }
    return response;
  },
  async (error: AxiosError) => {
    if (__DEV__) {
      console.error(
        `❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`
      );
    }

    const errorMessage =
      (error.response?.data as any)?.message ||
      error.message ||
      "An error occurred";

    return Promise.reject({
      ...error,
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

// ——— API helpers ———
export const apiHelpers = {
  async get<T = any>(url: string, config?: any): Promise<T> {
    const response = await api.get(url, config);
    return response.data;
  },

  async post<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await api.post(url, data, config);
    return response.data;
  },

  async put<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await api.put(url, data, config);
    return response.data;
  },

  async patch<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await api.patch(url, data, config);
    return response.data;
  },

  async delete<T = any>(url: string, config?: any): Promise<T> {
    const response = await api.delete(url, config);
    return response.data;
  },
}