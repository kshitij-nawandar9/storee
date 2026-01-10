import { Link } from 'react-router-dom';
import { Instagram, Mail, Phone, MapPin } from 'lucide-react';
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
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="md:col-span-1">
            {!logoError ? (
              <img
                src={currentLogoPath}
                alt="Storee Logo"
                className="h-10 w-auto mb-6"
                onError={handleLogoError}
              />
            ) : (
              <h3 className="text-2xl font-bold mb-6">Storee</h3>
            )}
            <p className="text-gray-400 mb-6 leading-relaxed">
              Your trusted destination for quality bag packs and pouches. Organize your life with style.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/thestoree.in?igsh=MnU5Mm52ZWQyMXBu"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-primary-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-primary-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-primary-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-bold text-lg mb-6">Customer Service</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="hover:text-white transition-colors cursor-pointer">Contact Us</li>
              <li className="hover:text-white transition-colors cursor-pointer">Shipping Info</li>
              <li className="hover:text-white transition-colors cursor-pointer">Returns & Refunds</li>
              <li className="hover:text-white transition-colors cursor-pointer">FAQ</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-6">Get in Touch</h4>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <a href="mailto:thestoree.in@gmail.com" className="hover:text-white transition-colors">
                  thestoree.in@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <a href="tel:+918329529225" className="hover:text-white transition-colors">
                  +91 83295 29225
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Storee. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
