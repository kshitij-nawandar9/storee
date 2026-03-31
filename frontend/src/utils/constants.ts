export const APP_NAME = 'Storee';

export const CURRENCY_SYMBOL = '₹';

export const FREE_SHIPPING_THRESHOLD = 100000; // ₹1000 in paise
export const SHIPPING_FEE = 9900; // ₹99 in paise
export const FREE_SHIPPING_MESSAGE = 'Free Pan India Delivery above ₹1,000';
export const SHIPPING_INFO = 'Orders will be dispatched in 5-7 working days. Delivery time depends on your location.';
export const RETURN_POLICY_MESSAGE = 'Hassle-free 7-day replacement policy';

// Launch sale – set to 0 to disable
export const LAUNCH_SALE_DISCOUNT = 0.25; // 25%
export const LAUNCH_SALE_END_DATE = '2026-04-30T23:59:59+05:30';

/** Return the sale price (in paise) after the launch discount, or undefined if no sale is active. */
export function getSalePrice(regularPrice: number): number | undefined {
  if (LAUNCH_SALE_DISCOUNT <= 0) return undefined;
  return Math.round(regularPrice * (1 - LAUNCH_SALE_DISCOUNT));
}

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
