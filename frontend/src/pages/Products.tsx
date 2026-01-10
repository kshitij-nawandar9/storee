import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/product/ProductCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Grid3x3 } from 'lucide-react';

export default function Products() {
  const { products, loading, error } = useProducts();

  return (
    <div className="min-h-screen py-12 bg-warm-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
            Our Collection
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Explore our complete range of premium pouches and bags
          </p>
        </div>

        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Grid3x3 className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg">No products found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
