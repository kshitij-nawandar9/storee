import type { Product } from '@/types';

export const APP_NAME = 'Storee';

export const CURRENCY_SYMBOL = '₹';

export const FREE_SHIPPING_THRESHOLD = 100000; // ₹1000 in paise
export const SHIPPING_FEE = 9900; // ₹99 in paise
export const FREE_SHIPPING_MESSAGE = 'Free Pan India Delivery above ₹1,000';
export const SHIPPING_INFO = 'Orders will be dispatched in 7-9 working days. Delivery time depends on your location.';
export const RETURN_POLICY_MESSAGE = 'Hassle-free 7-day replacement policy';

// Product sale. Hampers are excluded from this discount.
// The discount stops applying everywhere (banner, cart, checkout) once SALE_END_DATE passes.
export const SALE_NAME = 'Diwali Sale';
export const SALE_DISCOUNT = 0.2; // set to 0 to disable
export const SALE_END_DATE = '2026-11-08T23:59:59+05:30'; // Diwali day

export const isSaleActive = () =>
  SALE_DISCOUNT > 0 && Date.now() < new Date(SALE_END_DATE).getTime();

// Last day to order and still receive it by Diwali, given the 7-9 working day dispatch.
// The note is hidden automatically after this date.
export const DIWALI_ORDER_BY_DATE = '2026-10-24T23:59:59+05:30';
export const DIWALI_ORDER_BY_LABEL = '24 Oct';

export const isBeforeDiwaliCutoff = () =>
  Date.now() < new Date(DIWALI_ORDER_BY_DATE).getTime();

// The festive "Diwali night" homepage section hides itself after this date.
export const DIWALI_NIGHT_END_DATE = '2026-11-15T00:00:00+05:30';

export const isDiwaliSeason = () =>
  Date.now() < new Date(DIWALI_NIGHT_END_DATE).getTime();

// Game reward: a free 3D sticker sheet packed with the order.
// Off by default. Turn it on (VITE_STICKER_REWARD=true) only once sheets are in stock, and off again when they run out.
export const STICKER_REWARD_ENABLED = import.meta.env.VITE_STICKER_REWARD === 'true';
export const STICKER_SHEET = {
  name: 'Free 3D sticker sheet',
  sku: 'STOREE-STICKER-SHEET',
} as const;

// The internal category keeps its original name because it is stored with orders.
export const isHamperProduct = (product: Pick<Product, 'category'>) =>
  product.category === 'Rakhi Hampers';

/** Return the sale price (in paise) after the sale discount, or undefined if no sale is active or the product is excluded. */
export function getSalePrice(regularPrice: number, product?: Pick<Product, 'category'>): number | undefined {
  if (!isSaleActive()) return undefined;
  if (!product || isHamperProduct(product)) return undefined;
  return Math.round(regularPrice * (1 - SALE_DISCOUNT));
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
