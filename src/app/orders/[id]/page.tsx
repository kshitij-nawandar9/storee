"use client";

import { CheckCircle, Home, Package, ShoppingBag, Truck } from "lucide-react";
import Link from "next/link";
import { useParams, redirect } from "next/navigation";

export default function OrderConfirmation() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  if (!id) redirect("/");

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"><CheckCircle className="w-12 h-12 text-green-600" /></div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
          <p className="text-lg text-gray-600 mb-2">Thank you for your order. We&apos;ve received your order and will begin processing it shortly.</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 mt-6">
            <p className="text-sm text-gray-600 mb-1">Order ID</p>
            <p className="text-xl font-mono font-semibold text-gray-900">{id}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 text-left">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-blue-600" />What&apos;s Next?</h2>
            <div className="space-y-3 text-gray-700">
              {[
                { num: 1, title: "Order Confirmation", desc: "You'll receive an email confirmation shortly with your order details." },
                { num: 2, title: "Processing", desc: "We'll prepare your order and keep you updated on its status." },
                { num: 3, title: "Shipping", desc: "Your order will be shipped within 2-3 business days with free shipping." },
              ].map(({ num, title, desc }) => (
                <div key={num} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold mt-0.5">{num}</div>
                  <div><p className="font-medium">{title}</p><p className="text-sm text-gray-600">{num === 3 && <Truck className="w-4 h-4 inline-block mr-1" />}{desc}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="btn-primary flex items-center justify-center gap-2 py-3 px-6"><ShoppingBag className="w-5 h-5" />Continue Shopping</Link>
            <Link href="/" className="btn-secondary flex items-center justify-center gap-2 py-3 px-6"><Home className="w-5 h-5" />Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
