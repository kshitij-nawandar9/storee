"use client";

import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import { Truck, Shield, RotateCcw, Star, Instagram } from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "@/types";
import { PRODUCTS_DATA } from "@/data/products";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const filtered = PRODUCTS_DATA.filter((p) => p.isActive);
      setProducts(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen">
      <section className="w-full">
        <img src="/images/banner/2.jpg" alt="Storee Banner" className="w-full h-auto object-cover" />
      </section>

      <section className="py-20" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#2C4C64" }}>Featured Products</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#3A5C74" }}>Discover our handpicked collection of premium pouches and bags</p>
          </div>
          {loading && <LoadingSpinner />}
          {error && <ErrorMessage message={error} />}
          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.slice(0, 8).map((product, index) => (
                <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
          {!loading && !error && products.length === 0 && (
            <div className="text-center py-16"><p className="text-gray-600 text-lg">No products available at the moment.</p></div>
          )}
          {!loading && !error && products.length > 0 && (
            <div className="text-center mt-12">
              <Link href="/products" className="text-lg px-8 py-4 inline-flex items-center gap-2 group rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl" style={{ backgroundColor: "#2C4C64", color: "#D4A045" }}>
                View All Products
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-20" style={{ backgroundColor: "#FFF5F5" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#2C4C64" }}>Why Choose Storee?</h2>
            <p className="text-lg" style={{ color: "#3A5C74" }}>Experience the difference</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Truck, title: "Free Delivery", desc: "Free Pan India Delivery on all orders. Fast and reliable shipping." },
              { icon: Shield, title: "Secure Payment", desc: "Safe and secure payment options. Your data is protected." },
              { icon: RotateCcw, title: "Easy Returns", desc: "Hassle-free return policy. Shop with confidence." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white p-8 text-center group rounded-2xl shadow-md hover:shadow-xl transition-all duration-300" style={{ borderTop: "4px solid #D4A045" }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg" style={{ backgroundColor: "#2C4C64" }}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: "#2C4C64" }}>{title}</h3>
                <p className="leading-relaxed" style={{ color: "#3A5C74" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#2C4C64" }}>What Our Customers Say</h2>
            <p className="text-lg" style={{ color: "#3A5C74" }}>Trusted by parents across India</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              { name: "Priya Sharma", location: "Mumbai, Maharashtra", initial: "P", review: "\"The 7 Days Pack Kit has been a lifesaver for our family trips! My kids can now pack their own clothes for the week, and everything stays so organized. No more messy suitcases!\"" },
              { name: "Rajesh Kumar", location: "Bangalore, Karnataka", initial: "R", review: "\"Absolutely love the quality! The multipurpose pouches are perfect for organizing my daughter's art supplies, and the toiletry kit is a must-have for travel. Highly recommend!\"" },
            ].map(({ name, location, initial, review }) => (
              <div key={name} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300" style={{ borderLeft: "4px solid #D4A045" }}>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" style={{ color: "#D4A045" }} />)}
                </div>
                <p className="text-lg mb-6 leading-relaxed" style={{ color: "#3A5C74" }}>{review}</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: "#2C4C64" }}>{initial}</div>
                  <div>
                    <p className="font-semibold" style={{ color: "#2C4C64" }}>{name}</p>
                    <p className="text-sm" style={{ color: "#3A5C74" }}>{location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20" style={{ backgroundColor: "#FFF5F5" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Instagram className="w-10 h-10" style={{ color: "#D4A045" }} />
              <h2 className="text-4xl md:text-5xl font-bold" style={{ color: "#2C4C64" }}>Follow Us on Instagram</h2>
            </div>
            <p className="text-lg" style={{ color: "#3A5C74" }}>See our products in action</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {["DVdCXpwiBU7", "DVaZ2p6iA8J"].map((id) => (
              <div key={id} className="flex justify-center">
                <div className="w-full max-w-md">
                  <iframe src={`https://www.instagram.com/reel/${id}/embed`} width="100%" height="600" frameBorder="0" scrolling="no" className="rounded-2xl shadow-lg" title={`Instagram Reel`} />
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <a href="https://www.instagram.com/thestoree.in/" target="_blank" rel="noopener noreferrer" className="text-lg px-8 py-4 inline-flex items-center gap-3 group rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl" style={{ backgroundColor: "#2C4C64", color: "#D4A045" }}>
              <Instagram className="w-6 h-6" />
              Follow @thestoree.in
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
