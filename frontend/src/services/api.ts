import axios, { AxiosError } from 'axios';
import type { Product, ApiResponse } from '@/types';
import { mockProducts } from '@/data/mockProducts';
import type { CheckoutOrderItem } from '@/utils/orderItems';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
console.log('[API] Environment check:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA,
  VITE_FALLBACK_TO_MOCK: import.meta.env.VITE_FALLBACK_TO_MOCK,
  API_URL
});

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor - add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor — auto-logout on 401
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      console.error(`[API] ${error.config?.method?.toUpperCase()} ${error.config?.url} → ${error.response.status}`, error.response.data);

      // If we get a 401, the token is expired or invalid — clear auth state
      if (error.response.status === 401 && localStorage.getItem('auth_token')) {
        console.warn('[API] Received 401 — clearing stale auth token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.reload();
      }
    } else if (error.request) {
      console.error(`[API] ${error.config?.method?.toUpperCase()} ${error.config?.url} → No response (backend unreachable)`, { timeout: error.config?.timeout });
    } else {
      console.error(`[API] Request setup error:`, error.message);
    }
    return Promise.reject(error);
  }
);

// Helper to check if we should use mock data (only if explicitly enabled)
const shouldUseMockData = () => {
  // Only use mock data if explicitly set to 'true'
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  console.log('[API] VITE_USE_MOCK_DATA:', import.meta.env.VITE_USE_MOCK_DATA, 'shouldUseMockData:', useMock);
  return useMock;
};

// Product APIs
export const getProducts = async (category?: string): Promise<ApiResponse<Product[]>> => {
  // Use mock data only if explicitly enabled
  if (shouldUseMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    let products = [...mockProducts];
    
    if (category) {
      products = products.filter((p) => p.category === category);
    }
    
    return {
      success: true,
      message: 'Products fetched successfully (mock data)',
      data: products,
    };
  }

  // Always try to fetch from backend first
  try {
    const params = category ? { category } : {};
    const response = await api.get('/products', { params });
    return response.data;
  } catch (error) {
    // Only fallback to mock data if explicitly enabled
    if (import.meta.env.VITE_FALLBACK_TO_MOCK === 'true') {
      console.warn('Backend unavailable, using mock data as fallback');
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      let products = [...mockProducts];
      if (category) {
        products = products.filter((p) => p.category === category);
      }
      
      return {
        success: true,
        message: 'Products fetched successfully (mock data fallback)',
        data: products,
      };
    }
    
    // Otherwise, throw the error
    throw error;
  }
};

export const getProduct = async (id: string): Promise<ApiResponse<Product>> => {
  if (shouldUseMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const product = mockProducts.find((p) => p.id === id);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    return {
      success: true,
      message: 'Product fetched successfully (mock data)',
      data: product,
    };
  }

  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    // Only fallback to mock data if explicitly enabled
    if (import.meta.env.VITE_FALLBACK_TO_MOCK === 'true') {
      console.warn('Backend unavailable, using mock data as fallback');
      await new Promise((resolve) => setTimeout(resolve, 300));
      const product = mockProducts.find((p) => p.id === id);
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      return {
        success: true,
        message: 'Product fetched successfully (mock data fallback)',
        data: product,
      };
    }
    
    throw error;
  }
};

export const getProductBySlug = async (slug: string): Promise<ApiResponse<Product>> => {
  if (shouldUseMockData()) {
    console.log('[API] Using mock data, searching for slug:', slug);
    await new Promise((resolve) => setTimeout(resolve, 300));
    const product = mockProducts.find((p) => p.slug === slug);
    
    if (!product) {
      console.error('[API] Product not found in mock data. Available slugs:', mockProducts.map(p => p.slug));
      throw new Error(`Product not found: ${slug}`);
    }
    
    console.log('[API] Found product:', product.name);
    return {
      success: true,
      message: 'Product fetched successfully (mock data)',
      data: product,
    };
  }

  try {
    const response = await api.get(`/products/slug/${slug}`);
    return response.data;
  } catch (error) {
    // Only fallback to mock data if explicitly enabled
    if (import.meta.env.VITE_FALLBACK_TO_MOCK === 'true') {
      console.warn('Backend unavailable, using mock data as fallback');
      await new Promise((resolve) => setTimeout(resolve, 300));
      const product = mockProducts.find((p) => p.slug === slug);
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      return {
        success: true,
        message: 'Product fetched successfully (mock data fallback)',
        data: product,
      };
    }
    
    throw error;
  }
};

// Razorpay APIs
export const createRazorpayOrder = async (data: {
  amount: number;
  items: CheckoutOrderItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
}): Promise<ApiResponse<{ order: { id: string; order_id: string; razorpay_id: string; amount: number; currency: string; key_id: string } }>> => {
  console.log('[API] Creating Razorpay order...', { amount: data.amount, itemCount: data.items.length });
  const response = await api.post('/razorpay/create-order', data);
  console.log('[API] Razorpay order created:', { orderId: response.data?.data?.order?.order_id, razorpayId: response.data?.data?.order?.razorpay_id });
  return response.data;
};

export const verifyPayment = async (data: {
  order_id: string;
  payment_id: string;
  signature: string;
}): Promise<ApiResponse<{ paymentId: string; orderId: string }>> => {
  console.log('[API] Verifying payment...', { orderId: data.order_id, paymentId: data.payment_id });
  const response = await api.post('/razorpay/verify-payment', data);
  console.log('[API] Payment verification result:', { success: response.data?.success });
  return response.data;
};

// COD Order API
export const createCODOrder = async (data: {
  amount: number;
  items: CheckoutOrderItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
}): Promise<ApiResponse<any>> => {
  console.log('[API] Creating COD order...', { amount: data.amount, itemCount: data.items.length });
  const response = await api.post('/orders/cod', data);
  console.log('[API] COD order created:', { success: response.data?.success });
  return response.data;
};

// Admin APIs
export const getAdminOrders = async (params?: {
  status?: string;
  paymentMethod?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<{
  orders: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}>> => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.paymentMethod) queryParams.append('paymentMethod', params.paymentMethod);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  console.log('[API] Fetching admin orders...', Object.fromEntries(queryParams));
  const response = await api.get(`/admin/orders?${queryParams.toString()}`);
  console.log('[API] Admin orders fetched:', { count: response.data?.data?.orders?.length, total: response.data?.data?.pagination?.total });
  return response.data;
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<ApiResponse<any>> => {
  console.log('[API] Updating order status:', { orderId, status });
  const response = await api.put(`/admin/orders/${orderId}/status`, { status });
  console.log('[API] Order status update result:', { success: response.data?.success, orderId, status });
  return response.data;
};
