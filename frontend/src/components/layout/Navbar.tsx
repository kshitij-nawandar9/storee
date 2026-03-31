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

  useEffect(() => { setProfilePictureError(false); }, [user?.picture]);

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
    if (currentLogoPath === LOGO_PATH) setCurrentLogoPath(FALLBACK_LOGO_PATH);
    else setLogoError(true);
  };

  const isActive = (path: string) => location.pathname === path;

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      className="relative px-3 py-1.5 text-sm font-medium transition-all duration-200 group/nav"
      style={{
        color: isActive(to) ? '#C4756E' : '#2D2A26',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <span className="transition-transform duration-200 inline-block group-hover/nav:-translate-y-0.5">{label}</span>
      {/* Active dot */}
      {isActive(to) && (
        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full" style={{ background: '#C4756E' }} />
      )}
      {/* Hover underline — slides in */}
      {!isActive(to) && (
        <span
          className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all duration-200 w-0 group-hover/nav:w-4"
          style={{ background: '#C4756E', opacity: 0.4 }}
        />
      )}
    </Link>
  );

  return (
    <nav
      className="sticky top-0 z-50 transition-all duration-300 overflow-visible"
      style={{
        background: scrolled ? 'rgba(253, 246, 236, 0.95)' : 'rgba(253, 246, 236, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: scrolled ? '1px solid #F8EDDA' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3.5">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            {!logoError ? (
              <img
                src={currentLogoPath}
                alt="Storee"
                className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
                decoding="async"
                onError={handleLogoError}
              />
            ) : (
              <span className="font-serif text-2xl font-medium" style={{ color: '#2D2A26' }}>Storee</span>
            )}
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
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
              className="relative p-3 rounded-full transition-all duration-200 group/cart overflow-visible"
              aria-label="Shopping cart"
              style={{ color: '#2D2A26' }}
            >
              <ShoppingBag className="w-[18px] h-[18px]" />
              {itemCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 flex items-center justify-center text-[10px] font-bold text-white rounded-full"
                  style={{ background: '#C4756E' }}
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
                  className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full transition-all duration-200"
                  style={{ border: '1.5px solid #F8EDDA' }}
                >
                  {user?.picture && !profilePictureError ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-7 h-7 rounded-full"
                      style={{ border: '2px solid #F8EDDA' }}
                      loading="lazy"
                      decoding="async"
                      onError={() => setProfilePictureError(true)}
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#F8EDDA' }}>
                      <User className="w-4 h-4" style={{ color: '#6b635b' }} />
                    </div>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} style={{ color: '#8a827a' }} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl py-2 z-50 animate-slide-down" style={{ background: '#FFFDF9', boxShadow: '0 8px 32px -6px rgba(45,42,38,0.14)', border: '1px solid #F8EDDA' }}>
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid #F8EDDA' }}>
                      <p className="text-sm font-semibold truncate" style={{ color: '#2D2A26' }}>{user?.name}</p>
                      <p className="text-xs truncate mt-0.5" style={{ color: '#8a827a' }}>{user?.email}</p>
                    </div>
                    <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors" style={{ color: '#4a443e' }}>
                      <Package className="w-4 h-4" style={{ color: '#C4756E' }} /> My Orders
                    </Link>
                    {isAdmin && (
                      <Link to="/admin/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors" style={{ color: '#4a443e' }}>
                        <Package className="w-4 h-4" style={{ color: '#C4756E' }} /> Admin Orders
                      </Link>
                    )}
                    <div style={{ borderTop: '1px solid #F8EDDA', marginTop: '4px', paddingTop: '4px' }}>
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                        style={{ color: '#C4756E' }}
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/signin"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                style={{ background: '#3d2b2b', color: '#FDF6EC' }}
              >
                Sign In
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full transition-colors"
              style={{ color: '#2D2A26' }}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 animate-slide-down" style={{ borderTop: '1px solid #F8EDDA' }}>
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
                  className="px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    color: isActive(to) ? '#C4756E' : '#2D2A26',
                    background: isActive(to) ? 'rgba(196, 117, 110, 0.06)' : 'transparent',
                  }}
                >
                  {label}
                </Link>
              ))}
              {isAuthenticated ? (
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
                  style={{ color: '#C4756E' }}
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              ) : (
                <Link to="/signin" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-sm font-semibold" style={{ color: '#C4756E' }}>
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
