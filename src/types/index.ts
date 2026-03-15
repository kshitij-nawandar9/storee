export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  order: number;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  colorName: string;
  colorCode: string;
  image: string;
  price: number;
  stock: number;
  sku: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  category: string;
  images: ProductImage[];
  variants?: ProductVariant[];
  features?: string[];
  stock?: number;
  isActive: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: ProductVariant;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: Address;
  items: CartItem[];
  totalAmount: number;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentId?: string;
  paymentMethod: "razorpay" | "cod";
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
