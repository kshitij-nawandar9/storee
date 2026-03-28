import { Link } from 'react-router-dom';
import { Instagram, Mail, Phone, Heart } from 'lucide-react';
import { useState } from 'react';
import { LOGO_PATH, FALLBACK_LOGO_PATH } from '@/utils/logo';

export default function Footer() {
  const [logoError, setLogoError] = useState(false);
  const [currentLogoPath, setCurrentLogoPath] = useState(LOGO_PATH);

  const handleLogoError = () => {
    if (currentLogoPath === LOGO_PATH) {
      setCurrentLogoPath(FALLBACK_LOGO_PATH);
    } else {
      setLogoError(true);
    }
  };

  return (
    <footer style={{ background: 'linear-gradient(160deg, #1c3243 0%, #2C4C64 60%, #243f54 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            {!logoError ? (
              <img
                src={currentLogoPath}
                alt="Storee Logo"
                className="h-10 w-auto mb-5 brightness-200"
                onError={handleLogoError}
              />
            ) : (
              <h3 className="text-2xl font-display font-bold text-white mb-5">Storee</h3>
            )}
            <p className="text-primary-200 text-sm leading-relaxed mb-6">
              Home to your belongings. Cute, organised, and always on the go.
            </p>
            <a
              href="https://www.instagram.com/thestoree.in?igsh=MnU5Mm52ZWQyMXBu"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white border border-white/20 hover:bg-white/10 transition-all duration-200"
            >
              <Instagram className="w-4 h-4 text-gold-400" />
              @thestoree.in
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-gold-400 mb-5">Explore</h4>
            <ul className="space-y-3">
              {[
                { to: '/',        label: 'Home' },
                { to: '/products', label: 'Shop All' },
                { to: '/cart',    label: 'Cart' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-primary-200 hover:text-white text-sm transition-colors duration-200 flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-3 h-px bg-gold-400 transition-all duration-300 overflow-hidden" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-gold-400 mb-5">Support</h4>
            <ul className="space-y-3">
              {[
                { to: '/terms',   label: 'Shipping Info' },
                { to: '/terms',   label: 'Returns & Replacements' },
                { to: '/privacy', label: 'Privacy Policy' },
                { to: '/terms',   label: 'Terms of Service' },
              ].map(({ to, label }) => (
                <li key={label}>
                  <Link to={to} className="text-primary-200 hover:text-white text-sm transition-colors duration-200 flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-3 h-px bg-gold-400 transition-all duration-300 overflow-hidden" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-gold-400 mb-5">Get in Touch</h4>
            <ul className="space-y-4">
              <li>
                <a href="mailto:thestoree.in@gmail.com" className="flex items-start gap-3 text-primary-200 hover:text-white text-sm transition-colors group">
                  <Mail className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  thestoree.in@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+918329529225" className="flex items-start gap-3 text-primary-200 hover:text-white text-sm transition-colors group">
                  <Phone className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  +91 83295 29225
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-primary-300 text-xs flex items-center gap-1.5">
            &copy; {new Date().getFullYear()} Storee. Made with
            <Heart className="w-3 h-3 text-blush-400 fill-blush-400" />
            in India.
          </p>
          <div className="flex gap-6 text-xs text-primary-300">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms"   className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
