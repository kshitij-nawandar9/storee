export const APP_NAME = 'Storee';

export const CURRENCY_SYMBOL = '₹';

export const FREE_SHIPPING_THRESHOLD = 100000; // ₹1000 in paise
export const SHIPPING_FEE = 9900; // ₹99 in paise
export const FREE_SHIPPING_MESSAGE = 'Free Pan India Delivery above ₹1,000';
export const SHIPPING_INFO = 'Orders will be dispatched in 7-8 working days';
export const RETURN_POLICY_MESSAGE = 'Hassle-free 7-day return policy';

export const WHATSAPP_NUMBER = ''; // To be configured

export const PAYMENT_METHODS = {
  RAZORPAY: 'razorpay',
  COD: 'cod',
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;
