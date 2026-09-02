import { Link } from 'react-router-dom';
import { ArrowRight, Gift, Sparkles } from 'lucide-react';
import { getRakhiHamperBySlug, RAKHI_HAMPERS, type RakhiHamper } from '@/data/hampers';
import Img from '@/components/common/Img';
import RakhiThread from '@/components/hamper/RakhiThread';

export default function RakhiHamperBanner() {
  const hero = getRakhiHamperBySlug('rakhi-crossbody-keychain') ?? RAKHI_HAMPERS[0];
  const supporting = ['rakhi-multipurpose-keychain', 'rakhi-backpack-pencil']
    .map(getRakhiHamperBySlug)
    .filter((hamper): hamper is RakhiHamper => Boolean(hamper));

  return (
    <section className="relative overflow-hidden py-10 sm:py-14" style={{ background: '#FFFDF9' }}>
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #F0E0C6, transparent)' }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #F0E0C6, transparent)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, #FDF6EC 0%, #FFF4E1 42%, #FBE6DF 100%)',
            boxShadow: '0 12px 42px -18px rgba(59,50,48,0.22)',
          }}
        >
          <div
            className="absolute right-0 top-0 hidden h-full w-1/2 lg:block"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 30%, rgba(201,169,110,0.18) 0 12%, transparent 13%), radial-gradient(circle at 70% 70%, rgba(196,117,110,0.16) 0 10%, transparent 11%)',
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-6 lg:gap-10 p-5 sm:p-8 lg:p-10">
            <div className="relative z-10 flex flex-col justify-center py-2 sm:py-5">
              <div
                className="mb-4 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em]"
                style={{ background: '#3d2b2b', color: '#FDF6EC' }}
              >
                <Gift className="h-3.5 w-3.5" style={{ color: '#C9A96E' }} />
                Limited Rakhi edit
              </div>

              <p className="font-hand text-xl sm:text-2xl mb-1" style={{ color: '#C4756E' }}>
                tied with love, packed with joy
              </p>
              <h2 className="font-serif font-medium leading-tight mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', color: '#2a2220' }}>
                Rakhi Gift Hampers
              </h2>
              <RakhiThread className="mb-5 hidden sm:block opacity-80" variant="rose" />
              <p className="max-w-md text-sm sm:text-base leading-relaxed mb-6" style={{ color: '#6b5f58' }}>
                Cute combos, personalised keychains, and ready-to-gift bundles for siblings who deserve something more fun than the usual box.
              </p>

              <div className="mb-7">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em]" style={{ color: '#8a6e38' }}>
                  Shop by budget
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { label: 'Under ₹500', to: '/hampers?budget=under-500' },
                  { label: 'Under ₹800', to: '/hampers?budget=under-800' },
                  { label: 'Under ₹1100', to: '/hampers?budget=under-1100' },
                ].map(({ label, to }) => (
                  <Link
                    key={label}
                    to={to}
                    className="arrow-nudge rounded-2xl px-4 py-3 text-xs font-bold transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      background: '#FFFDF9',
                      color: '#3d2b2b',
                      border: '1px solid #F0E0C6',
                      boxShadow: '0 8px 22px -16px rgba(59,50,48,0.28)',
                    }}
                  >
                    <span className="flex items-center justify-between gap-3">
                      {label}
                      <ArrowRight className="h-3.5 w-3.5 arrow-icon" style={{ color: '#C4756E' }} />
                    </span>
                  </Link>
                ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/hampers" className="btn-primary arrow-nudge">
                  Shop Rakhi Hampers <ArrowRight className="h-4 w-4 arrow-icon" />
                </Link>
              </div>
            </div>

            <div className="relative min-h-[360px] sm:min-h-[440px] lg:min-h-[500px]">
              <div
                className="absolute left-6 top-2 z-20 w-[64%] max-w-[360px] overflow-hidden rounded-3xl rotate-[-3deg] transition-transform duration-500 hover:rotate-[-1deg] hover:scale-[1.02]"
                style={{ boxShadow: '0 18px 45px -20px rgba(42,34,32,0.42)', background: '#F8EDDA' }}
              >
                <Img
                  src={hero.images[0]?.url}
                  alt={hero.name}
                  sizes="(min-width: 1024px) 360px, 64vw"
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {supporting.map((hamper, idx) => (
                <div
                  key={hamper.id}
                  className="absolute overflow-hidden rounded-2xl transition-transform duration-500 hover:scale-[1.03]"
                  style={{
                    width: idx === 0 ? '42%' : '38%',
                    right: idx === 0 ? '4%' : '14%',
                    top: idx === 0 ? '8%' : '58%',
                    transform: idx === 0 ? 'rotate(4deg)' : 'rotate(-5deg)',
                    boxShadow: '0 16px 36px -18px rgba(42,34,32,0.38)',
                    background: '#F8EDDA',
                  }}
                >
                  <Img
                    src={hamper.images[0]?.url}
                    alt={hamper.name}
                    sizes="(min-width: 1024px) 240px, 42vw"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))}

              <div
                className="absolute bottom-5 left-3 sm:left-10 z-30 rounded-2xl px-4 py-3"
                style={{ background: 'rgba(255,253,249,0.92)', border: '1px solid #F0E0C6', boxShadow: '0 10px 30px -18px rgba(42,34,32,0.35)', backdropFilter: 'blur(10px)' }}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" style={{ color: '#C9A96E' }} />
                  <div>
                    <p className="text-xs font-bold" style={{ color: '#2a2220' }}>Personalised hampers</p>
                    <p className="text-[0.68rem]" style={{ color: '#8a7e78' }}>Add a name before checkout</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
