export const APP_NAME = "Storee";

export const CURRENCY_SYMBOL = "₹";

export const FREE_SHIPPING_MESSAGE = "Free Pan India Delivery";
export const SHIPPING_INFO = "Orders will be dispatched in 7-8 working days";

export const WHATSAPP_NUMBER = "";

export const PAYMENT_METHODS = {
  RAZORPAY: "razorpay",
  COD: "cod",
} as const;

export const ORDER_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;
