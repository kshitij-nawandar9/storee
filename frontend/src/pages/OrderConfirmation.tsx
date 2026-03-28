import { CheckCircle, Home, Package, ShoppingBag, Truck } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen" style={{ background: '#FDF6EC' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
        <div className="rounded-2xl p-8 sm:p-10 text-center" style={{ background: '#FFFDF9', boxShadow: '0 2px 12px -3px rgba(59,50,48,0.06)' }}>

          {/* Success icon */}
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(139,168,138,0.12)' }}>
            <CheckCircle className="w-8 h-8" style={{ color: '#8BA88A' }} />
          </div>

          <h1 className="font-serif text-2xl font-medium mb-2" style={{ color: '#2a2220' }}>
            Order placed! 🎉
          </h1>
          <p className="text-sm mb-6" style={{ color: '#8a7e78' }}>
            Thank you for your order. We'll start preparing it right away.
          </p>

          {/* Order ID */}
          <div className="rounded-xl px-5 py-3 mb-8 inline-block" style={{ background: '#FDF6EC' }}>
            <p className="text-xs mb-0.5" style={{ color: '#a09590' }}>Order ID</p>
            <p className="font-mono text-sm font-semibold" style={{ color: '#2a2220' }}>{id}</p>
          </div>

          {/* What's next */}
          <div className="rounded-xl p-5 mb-8 text-left" style={{ background: 'rgba(139,168,138,0.05)', border: '1px solid rgba(139,168,138,0.1)' }}>
            <h2 className="font-serif text-base font-medium mb-4 flex items-center gap-2" style={{ color: '#2a2220' }}>
              <Package className="w-4 h-4" style={{ color: '#8BA88A' }} />
              What's next?
            </h2>
            <div className="space-y-3">
              {[
                { step: '1', title: 'Confirmation', desc: 'You\'ll receive an email with your order details.' },
                { step: '2', title: 'Processing', desc: 'We\'ll prepare your order and keep you updated.' },
                { step: '3', title: 'Shipping', desc: 'Delivered within 5–7 business days with tracking.' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[0.6rem] font-bold" style={{ background: '#8BA88A', color: '#fff' }}>
                    {step}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#2a2220' }}>{title}</p>
                    <p className="text-xs" style={{ color: '#6b5f58' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/products" className="btn-primary inline-flex items-center justify-center gap-2 text-sm">
              <ShoppingBag className="w-4 h-4" /> Continue Shopping
            </Link>
            <Link to="/" className="btn-outline inline-flex items-center justify-center gap-2 text-sm">
              <Home className="w-4 h-4" /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
