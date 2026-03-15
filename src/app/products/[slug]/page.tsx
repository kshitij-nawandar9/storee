"use client";

import ErrorMessage from "@/components/common/ErrorMessage";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import PriceDisplay from "@/components/product/PriceDisplay";
import QuantitySelector from "@/components/product/QuantitySelector";
import { useCart } from "@/hooks/useCart";
import type { Product, ProductVariant } from "@/types";
import { FREE_SHIPPING_MESSAGE, SHIPPING_INFO } from "@/utils/constants";
import { PRODUCTS_DATA } from "@/data/products";
import { CheckCircle, ChevronLeft, ChevronRight, Shield, ShoppingCart, Truck, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";

export default function ProductDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [hoveredVariant, setHoveredVariant] = useState<ProductVariant | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  useEffect(() => {
    if (!slug) { setLoading(false); setError("No product slug provided"); return; }
    const found = PRODUCTS_DATA.find((p) => p.slug === slug);
    if (found) setProduct(found);
    else setError("Product not found");
    setLoading(false);
  }, [slug]);

  const defaultVariant = product?.variants?.find((v) => v.isDefault) || product?.variants?.[0];
  const currentVariant = selectedVariant || defaultVariant;

  useEffect(() => {
    if (!selectedVariant && defaultVariant) setSelectedVariant(defaultVariant);
  }, [selectedVariant, defaultVariant]);

  useEffect(() => {
    if (currentVariant && product?.variants && product.variants.length > 0) {
      const index = product.variants.findIndex((v) => v.id === currentVariant.id);
      if (index >= 0) setModalImageIndex(index);
    }
  }, [currentVariant, product?.variants]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    toast.success(`Added ${quantity} ${product.name} to cart`, { icon: "🛍️", style: { borderRadius: "10px", background: "#333", color: "#fff" } });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!product) return <ErrorMessage message="Product not found" />;

  const isComingSoon = !product.images || product.images.length === 0 || product.stock === 0;
  const variantImages = product.variants?.map((v) => v.image).filter(Boolean) || [];
  const productImageUrls = product.images?.map((img) => typeof img === "string" ? img : img.url).filter(Boolean) || [];
  const displayImages = variantImages.length > 0 ? variantImages : productImageUrls;
  const displayImage = hoveredVariant?.image || currentVariant?.image || product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || displayImages[0] || "/placeholder.jpg";

  const featureDescriptions: Record<string, string> = {
    "Multipurpose Storage": "Designed with versatility in mind, their practical sizes and portable form make them suitable for storing a variety of essentials, helping you stay organized and clutter-free",
    "Water-Resistant Protection": "Made using water-resistant fabric, they provide reliable protection against spills and moisture, keeping your essentials safe and dry whether you're at home or on the move",
    "Durable & Easy to Wash": "Crafted from high-quality, durable materials, these pouches are designed to withstand everyday use. They are easy to clean and maintain, ensuring long-lasting performance with minimal effort",
    "Perfect for Travel": "Compact, lightweight, and functional, these pouches are ideal for travel and daily use. Easy to slip into a handbag, backpack, or suitcase, they ensure hassle-free organization wherever you go",
    "Stylish & Functional": "Featuring trendy designs, they seamlessly blend style with utility, adding a fashionable touch to your everyday essentials",
  };

  return (
    <div className="min-h-screen py-12 bg-warm-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="animate-fade-in">
            <div className="card p-4">
              <div className="relative mb-4 overflow-hidden rounded-xl bg-gray-100 group cursor-pointer min-h-[400px] flex items-center justify-center" onClick={() => { if (displayImages.length > 0) { const ci = displayImages.findIndex((img) => img === displayImage); setModalImageIndex(ci >= 0 ? ci : 0); setIsImageModalOpen(true); } }}>
                {displayImage ? (
                  <img src={displayImage} alt={product.name} className="w-full h-auto object-cover transition-all duration-300" key={displayImage} onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg"; }} />
                ) : (
                  <div className="text-gray-400">No image available</div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium bg-black/50 px-4 py-2 rounded-lg">Click to enlarge</span>
                </div>
              </div>
              {displayImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {displayImages.map((img, index) => {
                    const variant = product.variants?.[index];
                    const isSelected = variant?.id === currentVariant?.id;
                    return (
                      <button key={index} onClick={() => variant && setSelectedVariant(variant)} onMouseEnter={() => variant && setHoveredVariant(variant)} onMouseLeave={() => setHoveredVariant(null)} className={`flex-shrink-0 p-1 border-2 rounded-lg transition-all overflow-hidden ${isSelected ? "border-primary-500 ring-2 ring-primary-200 shadow-md" : "border-gray-200 hover:border-gray-400"}`}>
                        <img src={img} alt={`${product.name} ${index + 1}`} className="w-16 h-16 object-cover rounded" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="animate-slide-up">
            <div className="card p-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">{product.name}</h1>
              <div className="mb-6"><PriceDisplay regularPrice={currentVariant?.price || product.basePrice} /></div>
              <p className="text-gray-700 mb-8 text-lg leading-relaxed">{product.description}</p>
              <div className="mb-8"><QuantitySelector quantity={quantity} maxQuantity={999} onQuantityChange={setQuantity} /></div>
              <button onClick={handleAddToCart} disabled={isComingSoon} className={`w-full text-lg py-4 flex items-center justify-center gap-2 mb-6 ${isComingSoon ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "btn-primary"}`}>
                {isComingSoon ? (<><span className="text-xl">🚀</span>Coming Soon</>) : (<><ShoppingCart className="w-5 h-5" />Add to Cart</>)}
              </button>
              {product.features && product.features.length > 0 && (
                <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <h3 className="font-bold text-xl mb-6 text-gray-900">Product Features</h3>
                  <div className="space-y-4">
                    {product.features.map((feature, index) => (
                      <div key={index} className="bg-white p-4 rounded-xl border border-orange-100 shadow-warm">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">{feature}</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">{featureDescriptions[feature] || feature}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0"><Truck className="w-5 h-5 text-white" /></div>
                  <div>
                    <div className="flex items-center gap-2 text-green-700 mb-1"><span className="font-bold">{FREE_SHIPPING_MESSAGE}</span></div>
                    <div className="text-sm text-green-600">{SHIPPING_INFO}</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600"><Shield className="w-4 h-4 text-primary-600" /><span>Secure Payment</span></div>
                <div className="flex items-center gap-2 text-sm text-gray-600"><Truck className="w-4 h-4 text-primary-600" /><span>Free Shipping</span></div>
                <div className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-primary-600" /><span>Quality Assured</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isImageModalOpen && displayImages.length > 0 && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsImageModalOpen(false)}>
          <div className="relative max-w-5xl max-h-screen bg-white rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsImageModalOpen(false)} className="absolute top-4 right-4 text-gray-800 hover:text-gray-600 p-2 rounded-full bg-white/90 hover:bg-white transition-all shadow-lg z-10" aria-label="Close"><X className="w-6 h-6" /></button>
            <div className="relative">
              <img src={displayImages[modalImageIndex]} alt={product.name} className="max-w-full max-h-[80vh] object-contain mx-auto rounded-lg" />
              {displayImages.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); setModalImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all" aria-label="Previous image"><ChevronLeft className="w-6 h-6 text-gray-800" /></button>
                  <button onClick={(e) => { e.stopPropagation(); setModalImageIndex((prev) => (prev + 1) % displayImages.length); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all" aria-label="Next image"><ChevronRight className="w-6 h-6 text-gray-800" /></button>
                </>
              )}
            </div>
            {displayImages.length > 1 && (
              <div className="flex gap-3 mt-6 justify-center overflow-x-auto pb-2">
                {displayImages.map((img, index) => (
                  <button key={index} onClick={(e) => { e.stopPropagation(); setModalImageIndex(index); }} className={`w-20 h-20 flex-shrink-0 p-1 border-2 rounded-lg transition-all ${modalImageIndex === index ? "border-primary-500 ring-2 ring-primary-200 shadow-md" : "border-gray-300 hover:border-gray-400"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover rounded" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
