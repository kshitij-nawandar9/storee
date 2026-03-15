"use client";

import Link from "next/link";
import type { Product } from "@/types";
import PriceDisplay from "./PriceDisplay";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const displayPrice = product.basePrice;
  const defaultVariant = product.variants?.find((v) => v.isDefault);
  const primaryImage =
    defaultVariant?.image ||
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url;
  const isComingSoon = !product.images || product.images.length === 0 || product.stock === 0;

  return (
    <div className="card card-hover group">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative overflow-hidden bg-gray-100">
          <img
            src={primaryImage || "/placeholder.jpg"}
            alt={product.name}
            className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          {isComingSoon && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
              Coming Soon
            </div>
          )}
          {!isComingSoon && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addItem(product, 1);
                  toast.success(`Added ${product.name} to cart`, {
                    icon: "🛍️",
                    style: { borderRadius: "10px", background: "#333", color: "#fff" },
                  });
                }}
                className="bg-white text-primary-600 px-4 py-2 rounded-xl font-semibold shadow-warm hover:bg-primary-50 transition-colors flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Quick Add
              </button>
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{product.description}</p>
          <div className="flex items-center justify-between">
            <PriceDisplay regularPrice={displayPrice} />
          </div>
        </div>
      </Link>
    </div>
  );
}
