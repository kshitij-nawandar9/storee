import axios, { AxiosError } from "axios";
import type { Product, ApiResponse } from "@/types";

const API_URL = "/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) console.error("API Error:", error.response.data);
    else if (error.request) console.warn("Backend not available");
    else console.error("Error:", error.message);
    return Promise.reject(error);
  }
);

export const getProducts = async (
  category?: string
): Promise<ApiResponse<Product[]>> => {
  const params = category ? { category } : {};
  const response = await api.get("/products", { params });
  return response.data;
};

export const getProduct = async (
  id: string
): Promise<ApiResponse<Product>> => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const getProductBySlug = async (
  slug: string
): Promise<ApiResponse<Product>> => {
  const response = await api.get(`/products/slug/${slug}`);
  return response.data;
};

export const createRazorpayOrder = async (data: {
  amount: number;
  items: unknown[];
  customer: { name: string; email: string; phone: string };
  address: { line1: string; line2?: string; city: string; state: string; pincode: string };
}): Promise<
  ApiResponse<{
    order: {
      id: string;
      order_id: string;
      razorpay_id: string;
      amount: number;
      currency: string;
      key_id: string;
    };
  }>
> => {
  const response = await api.post("/razorpay/create-order", data);
  return response.data;
};

export const verifyPayment = async (data: {
  order_id: string;
  payment_id: string;
  signature: string;
}): Promise<ApiResponse<{ paymentId: string; orderId: string }>> => {
  const response = await api.post("/razorpay/verify-payment", data);
  return response.data;
};

export const createCODOrder = async (data: {
  amount: number;
  items: unknown[];
  customer: { name: string; email: string; phone: string };
  address: { line1: string; line2?: string; city: string; state: string; pincode: string };
}): Promise<ApiResponse<unknown>> => {
  const response = await api.post("/orders/cod", data);
  return response.data;
};

export const getAdminOrders = async (params?: {
  status?: string;
  paymentMethod?: string;
  page?: number;
  limit?: number;
}): Promise<
  ApiResponse<{
    orders: unknown[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }>
> => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.paymentMethod) queryParams.append("paymentMethod", params.paymentMethod);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const response = await api.get(`/admin/orders?${queryParams.toString()}`);
  return response.data;
};

export const approveOrder = async (
  orderId: string
): Promise<ApiResponse<unknown>> => {
  const response = await api.put(`/admin/orders/${orderId}/approve`);
  return response.data;
};
