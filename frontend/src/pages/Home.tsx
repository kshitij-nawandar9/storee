import { Link } from 'react-router-dom';
import { Truck, Shield, RotateCcw, Star, Instagram, ArrowRight, Heart } from 'lucide-react';

const reviews = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai',
    text: 'The 7 Days Pack Kit has been a lifesaver for our family trips! My kids can now pack their own clothes for the week. Total game-changer.',
    initial: 'P',
    rating: 5,
    product: '7 Days Pack Kit',
  },
  {
    name: 'Rajesh Kumar',
    location: 'Bangalore',
    text: 'My daughter refuses to use anything else for her art supplies now. The quality is incredible — and the lion print? She\'s obsessed.',
    initial: 'R',
    rating: 5,
    product: 'Multipurpose Pouch',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: '#FDF6EC' }}>

      {/* ── MARQUEE ── */}
      <div className="overflow-hidden py-2.5" style={{ background: '#C4756E' }}>
        <div className="marquee-track select-none">
          {[...Array(2)].map((_, pass) => (
            <div key={pass} className="flex items-center">
              {[
                '✨ New prints just dropped',
                '🎀 Cute enough to gift',
                '🚚 Free shipping above ₹1,000',
                '🌊 Water-resistant magic',
                '🤍 Loved by 2,000+ families',
                '🇮🇳 Made in India with love',
              ].map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-5 px-7 text-xs font-medium tracking-wide whitespace-nowrap"
                  style={{ color: '#fff', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.04em' }}
                >
                  {item}
                  <span style={{ color: 'rgba(255,255,255,0.25)' }}>&diams;</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── HERO — image + text overlay ── */}
      <section className="relative w-full">
        <img
          src="/images/banner/4.jpeg"
          alt="Storee — Carry beautifully"
          className="w-full h-auto object-cover block"
        />
        {/* Minimal text — just bottom edge */}
        <div className="absolute bottom-0 left-0 right-0" style={{ background: 'linear-gradient(to top, rgba(42,34,32,0.6) 0%, rgba(42,34,32,0.2) 60%, transparent 100%)', padding: '5rem 0 0' }}>
          <div className="max-w-7xl mx-auto px-5 sm:px-8 pb-4 sm:pb-5 flex items-end justify-between gap-4">
            <div>
              <p className="font-hand text-base sm:text-lg" style={{ color: 'rgba(255,255,255,0.85)' }}>carry beautifully ✨</p>
              <p className="font-serif font-medium text-base sm:text-xl" style={{ color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                 Cute bags &amp; pouches for little adventurers
              </p>
            </div>
            <Link
              to="/products"
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 bounce-tap arrow-nudge"
              style={{ background: '#C4756E', color: '#fff', boxShadow: '0 4px 12px -4px rgba(196,117,110,0.4)' }}
            >
              Shop Now <ArrowRight className="w-3.5 h-3.5 arrow-icon" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP — hoverable items ── */}
      <section style={{ background: '#FFFDF9', borderBottom: '1px solid #F0E0C6' }}>
        <div className="max-w-5xl mx-auto px-4 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Truck,     label: 'Free Shipping', sub: 'above ₹1,000' },
              { icon: RotateCcw, label: '7-Day Returns', sub: 'no drama, promise' },
              { icon: Shield,    label: 'Secure Payments', sub: '100% safe' },
              { icon: Heart,     label: 'Made with Love', sub: 'in India 🇮🇳' },
            ].map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="flex items-center gap-3 justify-center py-2.5 px-3 rounded-xl transition-all duration-200 cursor-default group"
                style={{ background: 'transparent' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(196,117,110,0.04)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110" style={{ background: 'rgba(196,117,110,0.1)' }}>
                  <Icon className="w-4 h-4" style={{ color: '#C4756E' }} />
                </div>
                <div>
                  <p className="text-xs font-semibold leading-tight" style={{ color: '#2a2220' }}>{label}</p>
                  <p className="text-[0.65rem] font-medium leading-tight mt-0.5" style={{ color: '#a09590' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOP BY CATEGORY ── */}
      <section className="pt-16 pb-16 relative bg-warm-pattern">
        {/* Floating doodles */}
        <div className="absolute top-12 right-8 pointer-events-none hidden lg:block float-gentle" style={{ opacity: 0.07 }}>
          <svg width="44" height="44" viewBox="0 0 48 48" fill="none"><path d="M24 4l4.5 13.8H43l-11.7 8.5 4.5 13.8L24 31.6l-11.8 8.5 4.5-13.8L5 17.8h14.5z" stroke="#C4756E" strokeWidth="1.5" fill="none"/></svg>
        </div>
        <div className="absolute bottom-20 left-6 pointer-events-none hidden lg:block float-gentle-delay" style={{ opacity: 0.05 }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><path d="M16 4C16 4 20 10 26 12C20 14 16 20 16 20C16 20 12 14 6 12C12 10 16 4 16 4Z" stroke="#C9A96E" strokeWidth="1.5" fill="none"/></svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-10">
            <span className="section-label mb-2 block">Handpicked for you</span>
            <h2 className="section-title">Pick your fave ✨</h2>
            <p className="mt-2 text-sm max-w-md mx-auto leading-relaxed" style={{ color: '#8a7e78' }}>
              Find your perfect match — browse by what you're looking for.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[
              { category: 'Bags',              name: 'Bags',              sub: 'for little adventures',   image: '/images/products/kids_bag/Unicorn.png' },
              { category: 'Pouches',            name: 'Pouches',           sub: 'cute & clever',           image: '/images/products/accessories_kit/Beach.jpg' },
              { category: 'Travel Kits',        name: 'Travel Kits',       sub: 'pack like a pro',         image: '/images/products/foldable_travel_kit/Lion.jpg' },
              { category: 'Travel Organizers',   name: 'Organizers',       sub: 'everything in its place', image: '/images/products/packing_cubes/Rainbow.jpg' },
              { category: 'Specialty Kits',      name: 'Specialty Kits',   sub: 'for every little need',   image: '/images/products/pencil_pouch/Marine.png' },
              { category: null,                  name: 'Shop All',          sub: 'see everything ✨',       image: '/images/products/toiletry_kit/Unicorn.png' },
            ].map(({ category, name, sub, image }, index) => (
              <Link
                key={name}
                to={category ? `/products?category=${encodeURIComponent(category)}` : '/products'}
                className="group relative rounded-2xl overflow-hidden card-tilt animate-fade-in"
                style={{ aspectRatio: '4/5', animationDelay: `${index * 0.07}s` }}
              >
                <img
                  src={image}
                  alt={name}
                  className="w-full h-full object-cover product-img"
                />
                {/* Gradient overlay */}
                <div
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(to top, rgba(42,34,32,0.5) 0%, rgba(42,34,32,0.05) 45%, transparent 100%)' }}
                />
                {/* Text */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <p className="font-hand text-xs sm:text-sm" style={{ color: 'rgba(253,246,236,0.7)' }}>{sub}</p>
                  <h3 className="font-serif font-medium text-base sm:text-lg" style={{ color: '#fff', textShadow: '0 1px 6px rgba(0,0,0,0.1)' }}>
                    {name}
                  </h3>
                  <span className="inline-flex items-center gap-1 mt-1.5 text-[0.65rem] sm:text-xs font-medium arrow-nudge" style={{ color: 'rgba(253,246,236,0.6)' }}>
                    Browse <ArrowRight className="w-3 h-3 arrow-icon" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ── WHY STOREE ── */}
      <section className="py-16" style={{ background: '#FFFDF9' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-label mb-2 block">Why us?</span>
            <h2 className="section-title">Small details, big difference 🤍</h2>
            <p className="font-hand text-lg mt-2" style={{ color: '#C4756E', opacity: 0.7 }}>(the kind you'll notice on day 50, not just day 1)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                emoji: '🌈',
                title: 'Prints that spark joy',
                desc: 'Lions, unicorns, rainbows — every print is designed to make kids smile and parents say "okay, that\'s actually cute."',
                accent: '#C4756E',
                bg: 'rgba(196,117,110,0.05)',
              },
              {
                emoji: '🧸',
                title: 'Tough enough for tiny humans',
                desc: 'Water-resistant, machine-washable, and built to survive juice spills, mud, and the occasional tantrum throw.',
                accent: '#8BA88A',
                bg: 'rgba(139,168,138,0.06)',
              },
              {
                emoji: '🎒',
                title: 'A pocket for everything',
                desc: 'We know the struggle of "where did I put it?" — that\'s why every pouch has smart compartments that actually make sense.',
                accent: '#C9A96E',
                bg: 'rgba(201,169,110,0.06)',
              },
            ].map(({ emoji, title, desc, accent, bg }) => (
              <div
                key={title}
                className="p-7 rounded-2xl transition-all duration-300 hover:-translate-y-1 group"
                style={{ background: bg, boxShadow: '0 2px 12px -3px rgba(59,50,48,0.04)' }}
              >
                <div className="text-2xl mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 inline-block">{emoji}</div>
                <h3 className="font-serif text-lg font-medium mb-2" style={{ color: '#2a2220' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6b5f58' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="py-16 bg-warm-pattern">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="section-label mb-2 block">Real talk</span>
            <h2 className="section-title">Don't take our word for it 🤍</h2>
            <p className="font-hand text-lg mt-1" style={{ color: '#C9A96E', opacity: 0.7 }}>(okay maybe take theirs)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {reviews.map((r) => (
              <div
                key={r.name}
                className="rounded-2xl p-7 transition-all duration-300 hover:-translate-y-0.5"
                style={{ background: '#FFFDF9', boxShadow: '0 2px 16px -4px rgba(59,50,48,0.06)' }}
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" style={{ color: '#C9A96E' }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-2" style={{ color: '#3b3230' }}>
                  &ldquo;{r.text}&rdquo;
                </p>
                <p className="text-xs font-medium mb-5" style={{ color: '#C4756E' }}>
                  Bought: {r.product}
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-serif text-sm flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #C4756E, #d4918b)' }}
                  >
                    {r.initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#2a2220' }}>{r.name}</p>
                    <p className="text-xs" style={{ color: '#a09590' }}>{r.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INSTAGRAM ── */}
      <section className="py-16" style={{ background: '#FFFDF9' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="section-label mb-2 flex items-center justify-center gap-2">
              <Instagram className="w-3 h-3" /> Join the fam
            </span>
            <h2 className="section-title">@thestoree.in</h2>
            <p className="text-sm mt-2" style={{ color: '#8a7e78' }}>See the cuteness in action 🌸</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {[
              'https://www.instagram.com/reel/DVdCXpwiBU7/embed',
              'https://www.instagram.com/reel/DVaZ2p6iA8J/embed',
            ].map((src, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 20px -4px rgba(59,50,48,0.08)' }}>
                <iframe src={src} width="100%" height="520" frameBorder="0" scrolling="no" allowTransparency={true} title={`Reel ${i + 1}`} />
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="https://www.instagram.com/thestoree.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline inline-flex items-center gap-2 text-sm arrow-nudge"
            >
              <Instagram className="w-4 h-4" />
              Follow the cuteness <span className="arrow-icon">&rarr;</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="relative py-16 overflow-hidden" style={{ background: 'linear-gradient(135deg, #C4756E 0%, #d4918b 50%, #C4756E 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-80 h-80 rounded-full opacity-[0.08]" style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full opacity-[0.06]" style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />
        </div>
        <div className="max-w-2xl mx-auto px-4 text-center relative">
          <p className="font-hand text-2xl mb-3" style={{ color: 'rgba(255,255,255,0.8)' }}>psst... your perfect pouch is waiting 🎀</p>
          <h2 className="font-serif font-medium leading-tight mb-5" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: '#fff' }}>
            Ready to find yours?
          </h2>
          <p className="text-sm mb-8 leading-relaxed max-w-sm mx-auto" style={{ color: 'rgba(255,255,255,0.7)' }}>
            The kind of bag that makes strangers ask "where did you get that?"
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 bounce-tap arrow-nudge"
            style={{ background: '#fff', color: '#C4756E', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.15)' }}
          >
            Shop the Collection <ArrowRight className="w-4 h-4 arrow-icon" />
          </Link>
        </div>
      </section>

    </div>
  );
}
