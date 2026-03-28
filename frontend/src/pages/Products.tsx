import { useMemo, useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/product/ProductCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Grid3x3, ArrowRight } from 'lucide-react';

export default function Products() {
  const { products, loading, error } = useProducts();
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ['All', ...Array.from(cats).sort()];
  }, [products]);

  const filtered = activeCategory === 'All'
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen" style={{ background: '#FDF6EC' }}>

      {/* ── HEADER ───────────────────────────────── */}
      <section className="pt-14 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="section-label mb-2 block">Explore</span>
          <h1 className="section-title">All the good stuff ✨</h1>
          <p className="mt-3 text-sm max-w-md mx-auto leading-relaxed" style={{ color: '#8a7e78' }}>
            Pouches, bags, and kits that are almost too cute to use. Almost.
          </p>
        </div>
      </section>

      {/* ── CATEGORY FILTERS ─────────────────────── */}
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => {
              const isActive = cat === activeCategory;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="transition-all duration-200"
                  style={{
                    padding: '8px 20px',
                    borderRadius: '9999px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
                    background: isActive ? '#3d2b2b' : 'transparent',
                    color: isActive ? '#FDF6EC' : '#6b635b',
                    border: isActive ? '1.5px solid #3d2b2b' : '1.5px solid #F0E0C6',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(196,117,110,0.06)';
                      e.currentTarget.style.borderColor = '#C4756E';
                      e.currentTarget.style.color = '#C4756E';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = '#F0E0C6';
                      e.currentTarget.style.color = '#6b635b';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PRODUCT GRID ─────────────────────────── */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {loading && <LoadingSpinner />}
          {error && <ErrorMessage message={error} />}

          {!loading && !error && filtered.length > 0 && (
            <>
              <p className="text-xs font-medium mb-5" style={{ color: '#b0aaa3' }}>
                {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
                {activeCategory !== 'All' && <> in <span style={{ color: '#C4756E', fontWeight: 600 }}>{activeCategory}</span></>}
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                {filtered.map((product, index) => (
                  <div
                    key={product.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.04}s` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(196,117,110,0.06)' }}>
                <Grid3x3 className="w-7 h-7" style={{ color: '#C4756E' }} />
              </div>
              <p className="text-3xl mb-3">🌿</p>
              <p className="text-base font-serif font-medium mb-2" style={{ color: '#2a2220' }}>This shelf is empty!</p>
              <p className="text-sm mb-5" style={{ color: '#8a7e78' }}>But the other ones are packed with goodies.</p>
              <button
                onClick={() => setActiveCategory('All')}
                className="btn-outline text-xs inline-flex items-center gap-2"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
