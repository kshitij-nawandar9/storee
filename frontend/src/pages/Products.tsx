import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Grid3x3, ArrowRight } from 'lucide-react';
import { getSalePrice } from '@/utils/constants';

export default function Products() {
  const { products, loading, error } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All');

  // Sync URL param → state on navigation
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  // Update URL when category changes via pill click
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    if (cat === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

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
                  onClick={() => handleCategoryChange(cat)}
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
                {filtered.map((product, index) => {
                  const variants = product.variants?.filter((v) => v.isActive) ?? [];
                  const variant = variants.find((v) => v.isDefault) ?? variants[0];
                  const originalPrice = variant?.price ?? product.basePrice;
                  const salePrice = getSalePrice(originalPrice, product);
                  const effectivePrice = salePrice ?? originalPrice;
                  const formatINR = (p: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p / 100);
                  const displayPrice = formatINR(effectivePrice);
                  const displayOriginal = salePrice ? formatINR(originalPrice) : null;

                  return (
                    <Link
                      key={product.id}
                      to={`/products/${product.slug}`}
                      className="group flex flex-col rounded-2xl overflow-hidden card-tilt animate-fade-in"
                      style={{ background: '#FFFDF9', boxShadow: '0 2px 12px -3px rgba(59,50,48,0.06)', animationDelay: `${index * 0.04}s` }}
                    >
                      <div className="relative overflow-hidden" style={{ aspectRatio: '4/5', background: '#F8EDDA' }}>
                        <img
                          src={variant?.image || '/placeholder.jpg'}
                          alt={`${product.name}${variant ? ` - ${variant.colorName}` : ''}`}
                          className="product-img w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(to top, rgba(196,117,110,0.12) 0%, transparent 40%)' }} />
                      </div>
                      <div className="px-3.5 pt-3 pb-4 sm:px-4 sm:pt-3.5 sm:pb-5">
                        <h3 className="font-serif font-medium text-[0.9rem] sm:text-base leading-snug mb-1.5 line-clamp-1" style={{ color: '#2a2220' }}>
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            <span className="font-semibold text-base sm:text-lg" style={{ color: salePrice ? '#C4756E' : '#2a2220' }}>
                              {displayPrice}
                            </span>
                            {displayOriginal && (
                              <span className="text-xs line-through" style={{ color: '#b0aaa3' }}>{displayOriginal}</span>
                            )}
                          </div>
                          <span className="text-[0.7rem] sm:text-xs font-medium" style={{ color: '#C4756E' }}>
                            <span className="inline-flex items-center gap-0.5 arrow-nudge">View <span className="arrow-icon inline-block">&rarr;</span></span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
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
                onClick={() => handleCategoryChange('All')}
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
