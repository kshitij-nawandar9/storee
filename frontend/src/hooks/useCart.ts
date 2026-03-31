import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, ProductVariant, CartItem } from '@/types';
import { getSalePrice } from '@/utils/constants';

// Unique key combining product + variant (or just product if no variant)
function cartKey(productId: string, variantId?: string): string {
  return variantId ? `${productId}::${variantId}` : productId;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  getItem: (productId: string, variantId?: string) => CartItem | undefined;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1, variant?) => {
        const items = get().items;
        const key = cartKey(product.id, variant?.id);
        const existingItemIndex = items.findIndex(
          (item) => cartKey(item.product.id, item.variant?.id) === key
        );

        if (existingItemIndex >= 0) {
          const updatedItems = [...items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity,
          };
          set({ items: updatedItems });
        } else {
          set({
            items: [
              ...items,
              {
                product,
                quantity,
                variant,
              },
            ],
          });
        }
      },
      removeItem: (productId, variantId?) => {
        const key = cartKey(productId, variantId);
        set({
          items: get().items.filter(
            (item) => cartKey(item.product.id, item.variant?.id) !== key
          ),
        });
      },
      updateQuantity: (productId, quantity, variantId?) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        const key = cartKey(productId, variantId);
        set({
          items: get().items.map((item) =>
            cartKey(item.product.id, item.variant?.id) === key
              ? { ...item, quantity }
              : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce(
          (total, item) => {
            const unitPrice = item.variant?.price ?? item.product.basePrice;
            const effective = getSalePrice(unitPrice) ?? unitPrice;
            return total + effective * item.quantity;
          },
          0
        );
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
      getItem: (productId, variantId?) => {
        const key = cartKey(productId, variantId);
        return get().items.find(
          (item) => cartKey(item.product.id, item.variant?.id) === key
        );
      },
    }),
    {
      name: 'storee-cart',
    }
  )
);
