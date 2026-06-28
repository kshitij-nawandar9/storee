import type { CartItem } from '@/types';

export interface CheckoutOrderItem {
  productId: string;
  variantId?: string;
  name: string;
  slug: string;
  category: string;
  quantity: number;
  price: number;
  lineTotal: number;
  image?: string;
  printName?: string;
  sku?: string;
  customText?: string;
  product: {
    id: string;
    name: string;
    slug: string;
    category: string;
    basePrice: number;
  };
  variant?: {
    id: string;
    productId: string;
    colorName: string;
    colorCode: string;
    image: string;
    price: number;
    sku: string;
  };
}

type StoredOrderItem = {
  productId?: string;
  variantId?: string;
  name?: string;
  printName?: string;
  customText?: string;
  price?: number;
  sku?: string;
  quantity?: number;
  product?: {
    id?: string;
    name?: string;
    slug?: string;
    category?: string;
    basePrice?: number;
  };
  variant?: {
    id?: string;
    productId?: string;
    colorName?: string;
    colorCode?: string;
    image?: string;
    price?: number;
    sku?: string;
  };
};

const primaryImage = (item: CartItem) =>
  item.variant?.image ||
  item.product.images?.find((image) => image.isPrimary)?.url ||
  item.product.images?.[0]?.url;

export const buildCheckoutOrderItems = (items: CartItem[]): CheckoutOrderItem[] =>
  items.map((item) => {
    const unitPrice = item.variant?.price ?? item.product.basePrice;
    const printName = item.variant?.colorName;

    return {
      productId: item.product.id,
      ...(item.variant?.id ? { variantId: item.variant.id } : {}),
      name: item.product.name,
      slug: item.product.slug,
      category: item.product.category,
      quantity: item.quantity,
      price: unitPrice,
      lineTotal: unitPrice * item.quantity,
      ...(primaryImage(item) ? { image: primaryImage(item) } : {}),
      ...(printName ? { printName } : {}),
      ...(item.variant?.sku ? { sku: item.variant.sku } : {}),
      ...(item.customText ? { customText: item.customText } : {}),
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        category: item.product.category,
        basePrice: item.product.basePrice,
      },
      ...(item.variant
        ? {
            variant: {
              id: item.variant.id,
              productId: item.variant.productId,
              colorName: item.variant.colorName,
              colorCode: item.variant.colorCode,
              image: item.variant.image,
              price: item.variant.price,
              sku: item.variant.sku,
            },
          }
        : {}),
    };
  });

export const getStoredOrderItemName = (item: StoredOrderItem) =>
  item.product?.name || item.name || 'Product';

export const getStoredOrderItemPrint = (item: StoredOrderItem) =>
  item.printName || item.variant?.colorName;

export const getStoredOrderItemCustomText = (item: StoredOrderItem) =>
  item.customText;

export const getStoredOrderItemPrice = (item: StoredOrderItem) =>
  item.variant?.price ?? item.price ?? item.product?.basePrice ?? 0;
