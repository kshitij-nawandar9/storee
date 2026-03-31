import { Link, useLocation } from 'react-router-dom';
import { Instagram, Mail, Phone } from 'lucide-react';

function scrollToHash(hash: string) {
  const el = document.getElementById(hash);
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}

export default function Footer() {
  const location = useLocation();

  const handleLinkClick = (to: string, e: React.MouseEvent) => {
    const [path, hash] = to.split('#');
    if (hash && location.pathname === path) {
      e.preventDefault();
      scrollToHash(hash);
    }
  };

  return (
    <footer style={{ background: 'linear-gradient(160deg, #2a2220 0%, #3d2b2b 60%, #332624 100%)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-serif text-xl font-medium mb-4" style={{ color: '#FDF6EC' }}>Storee</h3>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(253,246,236,0.45)' }}>
              Cute bags and pouches that make everyday adventures a little more colourful. Made in India with a whole lot of love.
            </p>
            <a
              href="https://www.instagram.com/thestoree.in?igsh=MnU5Mm52ZWQyMXBu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-medium transition-colors"
              style={{ color: 'rgba(253,246,236,0.6)' }}
            >
              <Instagram className="w-4 h-4" style={{ color: '#C4756E' }} />
              @thestoree.in
            </a>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-serif text-sm font-medium mb-4" style={{ color: '#FDF6EC' }}>Explore</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/products', label: 'Shop All' },
                { to: '/cart', label: 'Cart' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm transition-colors duration-200" style={{ color: 'rgba(253,246,236,0.4)' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-serif text-sm font-medium mb-4" style={{ color: '#FDF6EC' }}>Support</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/terms#shipping', label: 'Shipping Info' },
                { to: '/terms#returns', label: 'Returns & Replacements' },
                { to: '/privacy', label: 'Privacy Policy' },
                { to: '/terms', label: 'Terms of Service' },
              ].map(({ to, label }) => (
                <li key={label}>
                  <Link to={to} onClick={(e) => handleLinkClick(to, e)} className="text-sm transition-colors duration-200" style={{ color: 'rgba(253,246,236,0.4)' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-sm font-medium mb-4" style={{ color: '#FDF6EC' }}>Get in Touch</h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:thestoree.in@gmail.com" className="flex items-center gap-2.5 text-sm transition-colors" style={{ color: 'rgba(253,246,236,0.4)' }}>
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#C4756E' }} />
                  thestoree.in@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+918329529225" className="flex items-center gap-2.5 text-sm transition-colors" style={{ color: 'rgba(253,246,236,0.4)' }}>
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#C4756E' }} />
                  +91 83295 29225
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: '1px solid rgba(253,246,236,0.08)' }}>
          <p className="text-xs" style={{ color: 'rgba(253,246,236,0.25)' }}>
            &copy; {new Date().getFullYear()} Storee. Made with 🤍 in India.
          </p>
          <div className="flex gap-5 text-xs" style={{ color: 'rgba(253,246,236,0.25)' }}>
            <Link to="/privacy" className="transition-colors hover:text-white/50">Privacy</Link>
            <Link to="/terms" className="transition-colors hover:text-white/50">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
