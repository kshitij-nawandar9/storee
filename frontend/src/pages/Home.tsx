import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/product/ProductCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Truck, Shield, RotateCcw } from 'lucide-react';

export default function Home() {
  const { products, loading, error } = useProducts();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="w-full">
        <img
          src="/images/banner/2.jpg"
          alt="Storee Banner"
          className="w-full h-auto object-cover"
        />
      </section>

      {/* Featured Products */}
      <section className="py-20" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#2C4C64' }}>
              Featured Products
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#3A5C74' }}>
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
                className="text-lg px-8 py-4 inline-flex items-center gap-2 group rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                style={{
                  backgroundColor: '#2C4C64',
                  color: '#D4A045'
                }}
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
      <section className="py-20" style={{ backgroundColor: '#FFF5F5' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#2C4C64' }}>
              Why Choose Storee?
            </h2>
            <p className="text-lg" style={{ color: '#3A5C74' }}>Experience the difference</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 text-center group rounded-2xl shadow-md hover:shadow-xl transition-all duration-300" style={{ borderTop: '4px solid #D4A045' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg" style={{ backgroundColor: '#2C4C64' }}>
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#2C4C64' }}>Free Delivery</h3>
              <p className="leading-relaxed" style={{ color: '#3A5C74' }}>Free Pan India Delivery on all orders. Fast and reliable shipping.</p>
            </div>

            <div className="bg-white p-8 text-center group rounded-2xl shadow-md hover:shadow-xl transition-all duration-300" style={{ borderTop: '4px solid #D4A045' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg" style={{ backgroundColor: '#2C4C64' }}>
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#2C4C64' }}>Secure Payment</h3>
              <p className="leading-relaxed" style={{ color: '#3A5C74' }}>Safe and secure payment options. Your data is protected.</p>
            </div>

            <div className="bg-white p-8 text-center group rounded-2xl shadow-md hover:shadow-xl transition-all duration-300" style={{ borderTop: '4px solid #D4A045' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg" style={{ backgroundColor: '#2C4C64' }}>
                <RotateCcw className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#2C4C64' }}>Easy Returns</h3>
              <p className="leading-relaxed" style={{ color: '#3A5C74' }}>Hassle-free return policy. Shop with confidence.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
