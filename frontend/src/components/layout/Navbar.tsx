import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LogOut, Package } from 'lucide-react';
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
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const isAdmin = user && ADMIN_EMAILS.includes(user.email?.toLowerCase() || '');

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const handleLogoError = () => {
    if (currentLogoPath === LOGO_PATH) {
      setCurrentLogoPath(FALLBACK_LOGO_PATH);
    } else {
      setLogoError(true);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/95 shadow-warm sticky top-0 z-50 backdrop-blur-sm border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            {!logoError ? (
              <img
                src={currentLogoPath}
                alt="Storee Logo"
                className="h-12 w-auto transition-transform group-hover:scale-105"
                onError={handleLogoError}
              />
            ) : null}
            <span className={`text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent ${logoError ? '' : 'hidden'}`}>
              Storee
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                isActive('/')
                  ? 'bg-primary-100 text-primary-700 shadow-sm'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-warm-50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                isActive('/products')
                  ? 'bg-primary-100 text-primary-700 shadow-sm'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-warm-50'
              }`}
            >
              Products
            </Link>
            <Link
              to="/cart"
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                isActive('/cart')
                  ? 'bg-primary-100 text-primary-700 shadow-sm'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-warm-50'
              }`}
            >
              Cart
            </Link>
            {isAuthenticated && (
              <Link
                to="/orders"
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                isActive('/orders')
                  ? 'bg-primary-100 text-primary-700 shadow-sm'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-warm-50'
              }`}
              >
                Orders
              </Link>
            )}
            {isAuthenticated && isAdmin && (
              <Link
                to="/admin/orders"
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                isActive('/admin/orders')
                  ? 'bg-primary-100 text-primary-700 shadow-sm'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-warm-50'
              }`}
              >
                Admin
              </Link>
            )}
          </div>

          {/* Cart Icon & User Menu */}
          <div className="flex items-center gap-4">
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-primary-600 transition-all duration-200 hover:bg-warm-50 rounded-xl group"
            >
              <ShoppingCart className="w-6 h-6 transition-transform group-hover:scale-110" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-warm animate-bounce-slow">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 text-gray-700 hover:text-primary-600 hover:bg-warm-50 rounded-xl transition-all"
                >
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-warm border border-orange-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link
                      to="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Package className="w-4 h-4" />
                      Order History
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Package className="w-4 h-4" />
                        Admin Orders
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-warm-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/signin"
                className="px-4 py-2 text-gray-700 hover:text-primary-600 transition-all duration-200 hover:bg-warm-50 rounded-xl font-medium flex items-center gap-2"
                title="Sign in"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-primary-600 hover:bg-warm-50 rounded-xl transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-slide-up">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive('/')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-warm-50'
                }`}
              >
                Home
              </Link>
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive('/products')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-warm-50'
                }`}
              >
                Products
              </Link>
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive('/cart')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-warm-50'
                }`}
              >
                Cart {itemCount > 0 && `(${itemCount})`}
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                      isActive('/orders')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-warm-50'
                    }`}
                  >
                    Orders
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                        isActive('/admin/orders')
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-700 hover:bg-warm-50'
                      }`}
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl font-medium transition-colors text-gray-700 hover:bg-warm-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                    isActive('/signin')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-warm-50'
                  }`}
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
