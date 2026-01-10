import axios, { AxiosError } from 'axios';
import type { Product, ApiResponse } from '@/types';
import { mockProducts } from '@/data/mockProducts';

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

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request made but no response - backend not available
      console.warn('Backend not available, using mock data');
    } else {
      // Something else happened
      console.error('Error:', error.message);
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
  items: any[];
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
}): Promise<ApiResponse<{ order: { id: string; razorpay_id: string; amount: number; currency: string; key_id: string } }>> => {
  const response = await api.post('/razorpay/create-order', data);
  return response.data;
};

export const verifyPayment = async (data: {
  order_id: string;
  payment_id: string;
  signature: string;
}): Promise<ApiResponse<{ paymentId: string; orderId: string }>> => {
  const response = await api.post('/razorpay/verify-payment', data);
  return response.data;
};

// COD Order API
export const createCODOrder = async (data: {
  amount: number;
  items: any[];
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
  const response = await api.post('/orders/cod', data);
  return response.data;
};
