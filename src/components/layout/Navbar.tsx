"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X, User, LogOut, Package } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useRef } from "react";
import { LOGO_PATH, FALLBACK_LOGO_PATH } from "@/utils/logo";

const ADMIN_EMAILS = ["thestoree.in@gmail.com", "kshitij.nawandar@razorpay.com"];

export default function Navbar() {
  const { getItemCount } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const itemCount = getItemCount();
  const [logoError, setLogoError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentLogoPath, setCurrentLogoPath] = useState(LOGO_PATH);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profilePictureError, setProfilePictureError] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const isAdmin = user && ADMIN_EMAILS.includes(user.email?.toLowerCase() || "");

  useEffect(() => { setProfilePictureError(false); }, [user?.picture]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setUserMenuOpen(false);
    };
    if (userMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  const handleLogoError = () => {
    if (currentLogoPath === LOGO_PATH) setCurrentLogoPath(FALLBACK_LOGO_PATH);
    else setLogoError(true);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white/95 shadow-warm sticky top-0 z-50 backdrop-blur-sm border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-3 group">
            {!logoError ? (
              <img src={currentLogoPath} alt="Storee Logo" className="h-12 w-auto transition-transform group-hover:scale-105" onError={handleLogoError} />
            ) : null}
            <span className={`text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent ${logoError ? "" : "hidden"}`}>Storee</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {[
              { href: "/", label: "Home" },
              { href: "/products", label: "Products" },
              { href: "/cart", label: "Cart" },
            ].map((link) => (
              <Link key={link.href} href={link.href} className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${isActive(link.href) ? "bg-primary-100 text-primary-700 shadow-sm" : "text-gray-700 hover:text-primary-600 hover:bg-warm-50"}`}>
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link href="/orders" className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${isActive("/orders") ? "bg-primary-100 text-primary-700 shadow-sm" : "text-gray-700 hover:text-primary-600 hover:bg-warm-50"}`}>Orders</Link>
            )}
            {isAuthenticated && isAdmin && (
              <Link href="/admin/orders" className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${isActive("/admin/orders") ? "bg-primary-100 text-primary-700 shadow-sm" : "text-gray-700 hover:text-primary-600 hover:bg-warm-50"}`}>Admin</Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-primary-600 transition-all duration-200 hover:bg-warm-50 rounded-xl group">
              <ShoppingCart className="w-6 h-6 transition-transform group-hover:scale-110" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-warm animate-bounce-slow">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-2 text-gray-700 hover:text-primary-600 hover:bg-warm-50 rounded-xl transition-all">
                  {user?.picture && !profilePictureError ? (
                    <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" onError={() => setProfilePictureError(true)} />
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
                    <Link href="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Package className="w-4 h-4" /> Order History
                    </Link>
                    {isAdmin && (
                      <Link href="/admin/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Package className="w-4 h-4" /> Admin Orders
                      </Link>
                    )}
                    <button onClick={() => { logout(); setUserMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-warm-50 rounded-lg transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/signin" className="px-4 py-2 text-gray-700 hover:text-primary-600 transition-all duration-200 hover:bg-warm-50 rounded-xl font-medium flex items-center gap-2" title="Sign in">
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-700 hover:text-primary-600 hover:bg-warm-50 rounded-xl transition-colors" aria-label="Toggle menu">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-slide-up">
            <div className="flex flex-col space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/products", label: "Products" },
                { href: "/cart", label: `Cart${itemCount > 0 ? ` (${itemCount})` : ""}` },
              ].map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className={`px-4 py-3 rounded-xl font-medium transition-colors ${isActive(link.href) ? "bg-primary-100 text-primary-700" : "text-gray-700 hover:bg-warm-50"}`}>
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className={`px-4 py-3 rounded-xl font-medium transition-colors ${isActive("/orders") ? "bg-primary-100 text-primary-700" : "text-gray-700 hover:bg-warm-50"}`}>Orders</Link>
                  {isAdmin && (
                    <Link href="/admin/orders" onClick={() => setMobileMenuOpen(false)} className={`px-4 py-3 rounded-xl font-medium transition-colors ${isActive("/admin/orders") ? "bg-primary-100 text-primary-700" : "text-gray-700 hover:bg-warm-50"}`}>Admin</Link>
                  )}
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl font-medium transition-colors text-gray-700 hover:bg-warm-50 flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <Link href="/signin" onClick={() => setMobileMenuOpen(false)} className={`px-4 py-3 rounded-xl font-medium transition-colors ${isActive("/signin") ? "bg-primary-100 text-primary-700" : "text-gray-700 hover:bg-warm-50"}`}>Sign In</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
