import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/product/ProductCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Truck, Shield, RotateCcw, Sparkles } from 'lucide-react';

export default function Home() {
  const { products, loading, error } = useProducts();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-24 md:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        {/* Warm overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Premium Quality Products</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent">
                Storee
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-primary-100 max-w-2xl mx-auto leading-relaxed">
              Quality Bag Packs & Pouches for Every Need. Organize your life with style and functionality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center gap-2 group"
              >
                Shop Now
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/products"
                className="btn-secondary text-lg px-8 py-4 inline-flex items-center justify-center gap-2"
              >
                Explore Collection
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
              Featured Products
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover our handpicked collection of premium pouches and bags
            </p>
          </div>
          
          {loading && <LoadingSpinner />}
          {error && <ErrorMessage message={error} />}
          
          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.slice(0, 8).map((product, index) => (
                <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">No products available at the moment.</p>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="text-center mt-12">
              <Link
                to="/products"
                className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2 group"
              >
                View All Products
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-warm-100 to-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
              Why Choose Storee?
            </h2>
            <p className="text-gray-600 text-lg">Experience the difference</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8 text-center group hover:border-orange-200">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-warm">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Free Delivery</h3>
              <p className="text-gray-600 leading-relaxed">Free Pan India Delivery on all orders. Fast and reliable shipping.</p>
            </div>
            
            <div className="card p-8 text-center group hover:border-orange-200">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-warm">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Secure Payment</h3>
              <p className="text-gray-600 leading-relaxed">Safe and secure payment options. Your data is protected.</p>
            </div>
            
            <div className="card p-8 text-center group hover:border-orange-200">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-warm">
                <RotateCcw className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Easy Returns</h3>
              <p className="text-gray-600 leading-relaxed">Hassle-free return policy. Shop with confidence.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
