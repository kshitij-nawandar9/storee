import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/product/ProductCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Truck, Shield, RotateCcw, Star, Instagram, Sparkles, ArrowRight, Package } from 'lucide-react';

const trustItems = [
  { icon: Truck,     headline: 'Free Shipping',        sub: 'On orders above ₹1,000' },
  { icon: RotateCcw, headline: '7-Day Replacement',    sub: 'Hassle-free, no questions' },
  { icon: Shield,    headline: 'Secure Payments',      sub: '100% safe & encrypted' },
  { icon: Package,   headline: 'Quality Assured',      sub: 'Tested & trusted products' },
];

const reviews = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai, Maharashtra',
    text: '"The 7 Days Pack Kit has been a lifesaver for our family trips! My kids can now pack their own clothes for the week, and everything stays so organised."',
    initial: 'P',
    rating: 5,
  },
  {
    name: 'Rajesh Kumar',
    location: 'Bangalore, Karnataka',
    text: '"Absolutely love the quality! The multipurpose pouches are perfect for organising my daughter\'s art supplies. Highly recommend to every parent!"',
    initial: 'R',
    rating: 5,
  },
];

export default function Home() {
  const { products, loading, error } = useProducts();

  return (
    <div className="min-h-screen">

      {/* ── MARQUEE STRIP ─────────────────────────── */}
      <div className="overflow-hidden py-3.5" style={{ background: 'linear-gradient(135deg, #9b6b7a, #c4748a, #9b6b7a)' }}>
        <div className="marquee-track select-none">
          {[...Array(2)].map((_, pass) => (
            <div key={pass} className="flex items-center">
              {[
                '✨ New Arrivals',
                '🌈 Cute Prints',
                '🚚 Free Shipping above ₹1,000',
                '🎀 Gifts They\'ll Love',
                '💧 Water-Resistant',
                '🌸 Limited Editions',
                '⭐ 5-Star Quality',
                '🛍️ Shop Now',
              ].map((item) => (
                <span key={item} className="flex items-center gap-3 px-6 text-sm font-semibold tracking-wide whitespace-nowrap" style={{ color: '#fdf4f4' }}>
                  {item}
                  <span style={{ color: '#fdf4f4', opacity: 0.4 }}>◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── HERO ──────────────────────────────────── */}
      <section className="w-full">
        <img
          src="/images/banner/1.jpeg"
          alt="Storee — Home to Your Belongings"
          className="w-full h-auto object-cover block"
        />
      </section>

      {/* ── TRUST BAR ─────────────────────────────── */}
      <section className="bg-white border-y border-warm-200">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustItems.map(({ icon: Icon, headline, sub }) => (
              <div key={headline} className="flex flex-col items-center text-center gap-2 py-1">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(212,160,69,0.10)' }}>
                  <Icon className="w-5 h-5" style={{ color: '#D4A045' }} />
                </div>
                <div>
                  <p className="text-sm font-700 font-semibold leading-snug" style={{ color: '#1c3243' }}>{headline}</p>
                  <p className="text-xs font-medium leading-snug mt-0.5" style={{ color: '#7a8fa0' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────── */}
      <section className="pt-16 pb-14 bg-warm-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
            <div>
              <p className="section-label mb-2 flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Handpicked for you
              </p>
              <h2 className="section-title">Our Favourites ✨</h2>
              <p className="text-gray-500 mt-2 text-sm max-w-md leading-relaxed">
                Cute, practical, and made to carry everything you love.
              </p>
            </div>
            <Link to="/products" className="btn-outline text-sm px-5 py-2.5 self-start sm:self-auto flex-shrink-0">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading && <LoadingSpinner />}
          {error && <ErrorMessage message={error} />}

          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {products.slice(0, 8).map((product, index) => (
                <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.06}s` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <p className="text-center text-gray-400 py-12">No products available at the moment.</p>
          )}
        </div>
      </section>

      {/* ── WHY STOREE ────────────────────────────── */}
      <section className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="section-label mb-2">The Storee Difference</p>
            <h2 className="section-title">Why you'll love us 🤍</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                emoji: '🚚',
                title: 'Free Delivery',
                desc: 'Free Pan India delivery on all orders above ₹1,000. Fast, reliable, right to your door.',
                bg: '#f0fdf4',
              },
              {
                emoji: '🔒',
                title: 'Secure Payment',
                desc: 'Every transaction is fully protected. Shop with complete peace of mind, always.',
                bg: '#eff6ff',
              },
              {
                emoji: '🔄',
                title: 'Easy Replacements',
                desc: 'Got an issue? We offer hassle-free replacements with a simple unboxing video.',
                bg: '#fff1f2',
              },
            ].map(({ emoji, title, desc, bg }) => (
              <div
                key={title}
                className="group p-7 rounded-3xl border border-warm-200 hover:border-primary-200 hover:shadow-card transition-all duration-300"
                style={{ backgroundColor: bg }}
              >
                <div className="text-4xl mb-4">{emoji}</div>
                <h3 className="font-bold text-lg text-primary-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ───────────────────────────────── */}
      <section className="py-14 bg-warm-pattern">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="section-label mb-2">Happy Customers</p>
            <h2 className="section-title">Loved across India 🇮🇳</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {reviews.map((r) => (
              <div
                key={r.name}
                className="bg-white rounded-3xl p-7 border border-warm-200 hover:shadow-card transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" style={{ color: '#D4A045' }} />
                  ))}
                </div>
                <p className="text-primary-800 text-base leading-relaxed mb-5 font-medium">
                  {r.text}
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #2C4C64, #3a6d96)' }}
                  >
                    {r.initial}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-primary-900">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INSTAGRAM ─────────────────────────────── */}
      <section className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="section-label mb-2 flex items-center justify-center gap-2">
              <Instagram className="w-3 h-3" /> Follow along
            </p>
            <h2 className="section-title">@thestoree.in</h2>
            <p className="text-sm text-gray-400 mt-2">See how people style their Storee finds</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {[
              'https://www.instagram.com/reel/DVdCXpwiBU7/embed',
              'https://www.instagram.com/reel/DVaZ2p6iA8J/embed',
            ].map((src, i) => (
              <div key={i} className="rounded-3xl overflow-hidden border border-warm-200" style={{ boxShadow: '0 4px 24px -6px rgba(44,76,100,0.12)' }}>
                <iframe src={src} width="100%" height="520" frameBorder="0" scrolling="no" allowTransparency={true} title={`Reel ${i + 1}`} />
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="https://www.instagram.com/thestoree.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline inline-flex items-center gap-2"
            >
              <Instagram className="w-4 h-4" />
              Follow us on Instagram
            </a>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────── */}
      <section className="py-14 bg-warm-pattern border-t border-warm-200">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="section-title mb-4">Find your perfect pouch 🛍️</h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed max-w-md mx-auto">
            Cute prints, durable quality, and thoughtful designs — everything you need to carry your world in style.
          </p>
          <Link to="/products" className="btn-gold px-10 py-4 text-base inline-flex items-center gap-2 group">
            Shop the Collection
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

    </div>
  );
}
