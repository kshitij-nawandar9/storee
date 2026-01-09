import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useProduct } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import ProductGallery from '@/components/product/ProductGallery';
import QuantitySelector from '@/components/product/QuantitySelector';
import PriceDisplay from '@/components/product/PriceDisplay';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import toast from 'react-hot-toast';
import { FREE_SHIPPING_MESSAGE, SHIPPING_INFO } from '@/utils/constants';
import { ShoppingCart, Truck, Shield, CheckCircle } from 'lucide-react';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { product, loading, error } = useProduct(slug || '');
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (!product) {
      toast.error('Product not found');
      return;
    }

    const stock = product.stock || 0;
    if (stock < quantity) {
      toast.error('Insufficient stock available');
      return;
    }

    if (stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    addItem(product, quantity);
    toast.success(`Added ${quantity} ${product.name} to cart`, {
      icon: '🛍️',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!product) return <ErrorMessage message="Product not found" />;

  const displayImages = product.images.map((img) => img.url);
  const stock = product.stock || 0;

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left: Product Images */}
          <div className="animate-fade-in">
            <div className="card p-4">
              <ProductGallery images={displayImages} productName={product.name} />
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="animate-slide-up">
            <div className="card p-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mb-6">
                <PriceDisplay regularPrice={product.basePrice} />
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-8 text-lg leading-relaxed">
                {product.description}
              </p>

              {/* Stock Status - Only show if out of stock */}
              {stock === 0 && (
                <div className="flex items-center gap-2 mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-red-700 font-medium">Out of Stock</span>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-8">
                <QuantitySelector
                  quantity={quantity}
                  maxQuantity={stock}
                  onQuantityChange={setQuantity}
                />
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={stock === 0}
                className="w-full btn-primary text-lg py-4 flex items-center justify-center gap-2 mb-6"
              >
                <ShoppingCart className="w-5 h-5" />
                {stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <h3 className="font-bold text-xl mb-6 text-gray-900">Product Features</h3>
                  <div className="space-y-4">
                    {product.features.map((feature, index) => {
                      // Map feature titles to their full descriptions
                      const featureDescriptions: Record<string, string> = {
                        'Multipurpose Storage': 'Designed with versatility in mind, their practical sizes and portable form make them suitable for storing a variety of essentials, helping you stay organized and clutter-free',
                        'Water-Resistant Protection': 'Made using water-resistant fabric, they provide reliable protection against spills and moisture, keeping your essentials safe and dry whether you\'re at home or on the move',
                        'Durable & Easy to Wash': 'Crafted from high-quality, durable materials, these pouches are designed to withstand everyday use. They are easy to clean and maintain, ensuring long-lasting performance with minimal effort',
                        'Perfect for Travel': 'Compact, lightweight, and functional, these pouches are ideal for travel and daily use. Easy to slip into a handbag, backpack, or suitcase, they ensure hassle-free organization wherever you go',
                        'Stylish & Functional': 'Featuring trendy designs, they seamlessly blend style with utility, adding a fashionable touch to your everyday essentials',
                      };
                      
                      const description = featureDescriptions[feature] || feature;
                      
                      return (
                        <div key={index} className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1">{feature}</h4>
                              <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Free Delivery Banner */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-green-700 mb-1">
                      <span className="font-bold">{FREE_SHIPPING_MESSAGE}</span>
                    </div>
                    <div className="text-sm text-green-600">{SHIPPING_INFO}</div>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-primary-600" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck className="w-4 h-4 text-primary-600" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-primary-600" />
                  <span>Quality Assured</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
