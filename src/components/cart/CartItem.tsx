"use client";

import { Trash2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import type { CartItem as CartItemType } from "@/types";
import QuantitySelector from "@/components/product/QuantitySelector";
import PriceDisplay from "@/components/product/PriceDisplay";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQuantity } = useCart();
  const { product, quantity } = item;
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];

  return (
    <div className="flex gap-6 p-6 hover:bg-gray-50 transition-colors">
      <div className="w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
        <img src={primaryImage?.url || "/placeholder.jpg"} alt={product.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-lg mb-2 text-gray-900">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
        <QuantitySelector quantity={quantity} maxQuantity={999} onQuantityChange={(q) => updateQuantity(product.id, q)} />
      </div>
      <div className="flex flex-col items-end justify-between min-w-[120px]">
        <PriceDisplay regularPrice={product.basePrice * quantity} />
        <button
          onClick={() => removeItem(product.id)}
          className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all duration-200 group"
          aria-label="Remove item"
        >
          <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
}
