import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { LAUNCH_SALE_DISCOUNT, LAUNCH_SALE_END_DATE } from '@/utils/constants';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(): TimeLeft | null {
  const diff = new Date(LAUNCH_SALE_END_DATE).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function SaleBanner() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (LAUNCH_SALE_DISCOUNT <= 0) return null;

  const discountPct = Math.round(LAUNCH_SALE_DISCOUNT * 100);

  const segments: { value: number; label: string }[] = timeLeft
    ? [
        { value: timeLeft.days, label: 'Days' },
        { value: timeLeft.hours, label: 'Hours' },
        { value: timeLeft.minutes, label: 'Mins' },
        { value: timeLeft.seconds, label: 'Secs' },
      ]
    : [];

  return (
    <section
      className="animate-fade-in py-5 sm:py-7"
      style={{ background: 'linear-gradient(180deg, #FDF6EC 0%, #FFFDF9 100%)' }}
    >
      <div className="max-w-2xl mx-auto px-4 text-center">
        <p className="font-hand text-sm sm:text-base mb-1" style={{ color: '#C4756E' }}>
          psst... you came at the right time
        </p>

        <h2
          className="font-serif font-semibold animate-slide-up mb-1.5"
          style={{
            fontSize: 'clamp(1.35rem, 4vw, 2rem)',
            color: '#2a2220',
            lineHeight: 1.15,
          }}
        >
          FLAT {discountPct}% OFF Everything
        </h2>

        <p className="text-xs sm:text-sm mb-4" style={{ color: '#8a7e78', fontFamily: "'DM Sans', sans-serif" }}>
          Our launch celebration — every bag, every pouch, every kit.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 bounce-tap arrow-nudge"
            style={{ background: '#C4756E', color: '#fff', boxShadow: '0 4px 12px -4px rgba(196,117,110,0.4)' }}
          >
            Shop the Sale <ArrowRight className="w-3.5 h-3.5 arrow-icon" />
          </Link>

          {segments.length > 0 && (
            <div className="flex items-center gap-2 sm:gap-3">
              {segments.map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center">
                  <div
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(196,117,110,0.08)', border: '1px solid rgba(196,117,110,0.12)' }}
                  >
                    <span
                      className="font-serif font-semibold text-sm sm:text-base"
                      style={{ color: '#C4756E' }}
                    >
                      {String(value).padStart(2, '0')}
                    </span>
                  </div>
                  <span
                    className="text-[0.55rem] sm:text-[0.6rem] font-medium mt-1 uppercase tracking-wider"
                    style={{ color: '#a09590', fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
