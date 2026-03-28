import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, LogOut, Package, ChevronDown } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { LOGO_PATH, FALLBACK_LOGO_PATH } from '@/utils/logo';

const ADMIN_EMAILS = ['thestoree.in@gmail.com', 'kshitij.nawandar@razorpay.com'];

export default function Navbar() {
  const { getItemCount } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const itemCount = getItemCount();
  const [logoError, setLogoError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentLogoPath, setCurrentLogoPath] = useState(LOGO_PATH);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profilePictureError, setProfilePictureError] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = user && ADMIN_EMAILS.includes(user.email?.toLowerCase() || '');

  useEffect(() => {
    setProfilePictureError(false);
  }, [user?.picture]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const handleLogoError = () => {
    if (currentLogoPath === LOGO_PATH) {
      setCurrentLogoPath(FALLBACK_LOGO_PATH);
    } else {
      setLogoError(true);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full
        ${isActive(to)
          ? 'text-primary-600 bg-primary-50'
          : 'text-primary-800 hover:text-primary-600 hover:bg-warm-100'
        }`}
    >
      {label}
      {isActive(to) && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold-400" />
      )}
    </Link>
  );

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300
        ${scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-soft border-b border-warm-200'
          : 'bg-white/90 backdrop-blur-sm border-b border-warm-100'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 py-3">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            {!logoError ? (
              <img
                src={currentLogoPath}
                alt="Storee Logo"
                className="h-11 w-auto transition-transform duration-300 group-hover:scale-105"
                onError={handleLogoError}
              />
            ) : (
              <span className="text-2xl font-display font-bold text-gradient">Storee</span>
            )}
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLink('/', 'Home')}
            {navLink('/products', 'Shop')}
            {isAuthenticated && navLink('/orders', 'Orders')}
            {isAuthenticated && isAdmin && navLink('/admin/orders', 'Admin')}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full text-primary-700 hover:text-primary-600 hover:bg-warm-100 transition-all duration-200 group"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white rounded-full"
                  style={{ background: 'linear-gradient(135deg, #D4A045, #e8b558)' }}
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full border border-warm-200 hover:border-primary-200 hover:bg-warm-50 transition-all duration-200"
                >
                  {user?.picture && !profilePictureError ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-7 h-7 rounded-full ring-2 ring-gold-200"
                      onError={() => setProfilePictureError(true)}
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 text-primary-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-card border border-warm-200 py-2 z-50 animate-slide-down">
                    <div className="px-4 py-3 border-b border-warm-100">
                      <p className="text-sm font-semibold text-primary-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
                    </div>
                    <Link
                      to="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-700 hover:bg-warm-50 transition-colors"
                    >
                      <Package className="w-4 h-4 text-gold-400" />
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-700 hover:bg-warm-50 transition-colors"
                      >
                        <Package className="w-4 h-4 text-gold-400" />
                        Admin Orders
                      </Link>
                    )}
                    <div className="border-t border-warm-100 mt-1 pt-1">
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-blush-500 hover:bg-blush-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/signin"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:shadow-gold hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #2C4C64, #3a6d96)' }}
              >
                <User className="w-4 h-4" />
                Sign In
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full text-primary-700 hover:bg-warm-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-warm-100 animate-slide-down">
            <div className="flex flex-col gap-1 pt-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/products', label: 'Shop' },
                ...(isAuthenticated ? [{ to: '/orders', label: 'My Orders' }] : []),
                ...(isAuthenticated && isAdmin ? [{ to: '/admin/orders', label: 'Admin' }] : []),
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-2xl text-sm font-medium transition-colors
                    ${isActive(to)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-primary-800 hover:bg-warm-100'
                    }`}
                >
                  {label}
                </Link>
              ))}
              {isAuthenticated ? (
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="text-left px-4 py-3 rounded-2xl text-sm font-medium text-blush-500 hover:bg-blush-50 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-2xl text-sm font-semibold text-primary-600 hover:bg-warm-100 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
