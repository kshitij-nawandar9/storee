import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Gift, Heart, PackageCheck, Sparkles, Truck } from 'lucide-react';
import HamperCard from '@/components/hamper/HamperCard';
import RakhiThread from '@/components/hamper/RakhiThread';
import { RAKHI_BUDGETS, RAKHI_HAMPERS, type HamperBudget } from '@/data/hampers';
import { FREE_SHIPPING_MESSAGE, SHIPPING_INFO } from '@/utils/constants';

type ActiveBudget = 'all' | HamperBudget;

export default function Hampers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const budgetParam = searchParams.get('budget') as ActiveBudget | null;
  const activeBudget: ActiveBudget = RAKHI_BUDGETS.some((budget) => budget.id === budgetParam)
    ? budgetParam || 'all'
    : 'all';

  const hampers = activeBudget === 'all'
    ? RAKHI_HAMPERS
    : RAKHI_HAMPERS.filter((hamper) => hamper.budget === activeBudget);

  const setBudget = (budget: ActiveBudget) => {
    if (budget === 'all') setSearchParams({});
    else setSearchParams({ budget });
  };

  const heroHamper = RAKHI_HAMPERS[2];
  const sideHamper = RAKHI_HAMPERS[1];

  return (
    <div className="min-h-screen" style={{ background: '#FDF6EC' }}>
      <section className="relative overflow-hidden pt-10 pb-8 sm:pt-14 sm:pb-12">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              'radial-gradient(circle at 18% 22%, rgba(196,117,110,0.10) 0 10%, transparent 11%), radial-gradient(circle at 82% 18%, rgba(201,169,110,0.12) 0 9%, transparent 10%), radial-gradient(circle at 72% 82%, rgba(139,168,138,0.10) 0 10%, transparent 11%)',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-12 items-center">
            <div>
              <div
                className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em]"
                style={{ background: '#3d2b2b', color: '#FDF6EC' }}
              >
                <Gift className="h-3.5 w-3.5" style={{ color: '#C9A96E' }} />
                Limited-time festive drop
              </div>

              <p className="font-hand text-xl sm:text-2xl mb-1" style={{ color: '#C4756E' }}>
                for the sibling who deserves the cute stuff
              </p>
              <h1 className="font-serif font-medium leading-tight mb-4" style={{ fontSize: 'clamp(2.4rem, 7vw, 5rem)', color: '#2a2220' }}>
                Rakhi Hampers
              </h1>
              <RakhiThread className="mb-5 hidden sm:block opacity-85" variant="gold" />
              <p className="max-w-xl text-sm sm:text-base leading-relaxed mb-6" style={{ color: '#6b5f58' }}>
                Gift-ready bundles with playful prints, useful bags and pouches, and personalised keychains in budget-friendly picks.
              </p>

              <div className="flex flex-wrap gap-2 mb-7">
                {RAKHI_BUDGETS.map((budget) => {
                  const isActive = activeBudget === budget.id;
                  return (
                    <button
                      key={budget.id}
                      type="button"
                      onClick={() => setBudget(budget.id)}
                      className="transition-all duration-200"
                      style={{
                        padding: '9px 18px',
                        borderRadius: '9999px',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        fontFamily: "'DM Sans', sans-serif",
                        background: isActive ? '#3d2b2b' : '#FFFDF9',
                        color: isActive ? '#FDF6EC' : '#4a443e',
                        border: isActive ? '1.5px solid #3d2b2b' : '1.5px solid #F0E0C6',
                        boxShadow: isActive ? '0 6px 18px -10px rgba(59,50,48,0.3)' : 'none',
                      }}
                    >
                      {budget.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-xl">
                {[
                  { icon: PackageCheck, label: 'Gift-ready combos' },
                  { icon: Heart, label: 'Personalised picks' },
                  { icon: Truck, label: FREE_SHIPPING_MESSAGE },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 rounded-2xl px-3 py-3 text-xs font-semibold"
                    style={{ background: '#FFFDF9', color: '#4a443e', border: '1px solid #F0E0C6' }}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" style={{ color: '#C4756E' }} />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[390px] sm:min-h-[500px]">
              <div
                className="absolute left-0 top-6 w-[66%] max-w-[430px] overflow-hidden rounded-3xl rotate-[-4deg]"
                style={{ background: '#F8EDDA', boxShadow: '0 20px 54px -24px rgba(42,34,32,0.42)' }}
              >
                <img
                  src={heroHamper.images[0]?.url}
                  alt={heroHamper.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div
                className="absolute right-0 top-0 w-[45%] max-w-[300px] overflow-hidden rounded-2xl rotate-[5deg]"
                style={{ background: '#F8EDDA', boxShadow: '0 18px 44px -24px rgba(42,34,32,0.38)' }}
              >
                <img
                  src={sideHamper.images[0]?.url}
                  alt={sideHamper.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div
                className="absolute bottom-4 right-6 rounded-2xl p-4 sm:p-5"
                style={{ background: 'rgba(255,253,249,0.94)', border: '1px solid #F0E0C6', boxShadow: '0 14px 36px -22px rgba(42,34,32,0.4)', backdropFilter: 'blur(10px)' }}
              >
                <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em]" style={{ color: '#C4756E' }}>
                  <Sparkles className="h-3.5 w-3.5" />
                  Festival favourite
                </p>
                <p className="font-serif text-lg font-medium leading-tight" style={{ color: '#2a2220' }}>
                  Pick by budget, add a name, send the cutest gift.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-5">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
              <div>
                <span className="section-label mb-1 block">Shop the edit</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium" style={{ color: '#2a2220' }}>
                  {hampers.length} {hampers.length === 1 ? 'hamper' : 'hampers'} ready to gift
                </h2>
              </div>
              <p className="text-xs sm:text-sm max-w-sm" style={{ color: '#8a7e78' }}>
                {SHIPPING_INFO}
              </p>
            </div>
            <div className="mt-4 hidden md:flex justify-center">
              <RakhiThread className="rotate-[1deg] opacity-80" variant="rose" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {hampers.map((hamper, index) => (
              <HamperCard key={hamper.id} hamper={hamper} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16 sm:pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-3xl px-5 py-8 sm:px-8 sm:py-10 text-center"
            style={{ background: '#FFFDF9', border: '1px solid #F0E0C6', boxShadow: '0 2px 18px -8px rgba(59,50,48,0.08)' }}
          >
            <p className="font-hand text-xl mb-1" style={{ color: '#C4756E' }}>
              still exploring?
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium mb-3" style={{ color: '#2a2220' }}>
              Browse the full Storee collection
            </h2>
            <p className="text-sm max-w-md mx-auto mb-6" style={{ color: '#6b5f58' }}>
              Mix a hamper with an extra pouch, bag, or organiser to build your own sibling gift set.
            </p>
            <Link to="/products" className="btn-outline arrow-nudge">
              Shop All Products <ArrowRight className="h-4 w-4 arrow-icon" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
