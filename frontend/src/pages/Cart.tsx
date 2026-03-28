import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import CartItem from '@/components/cart/CartItem';
import PriceDisplay from '@/components/product/PriceDisplay';
import { CURRENCY_SYMBOL, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '@/utils/constants';
import { ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';

export default function Cart() {
  const { items, getTotal, clearCart } = useCart();
  const total = getTotal();
  const isFreeShipping = total >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = isFreeShipping ? 0 : SHIPPING_FEE;
  const finalTotal = total + shippingCost;

  if (items.length === 0) {
    return (
      <div className="min-h-screen" style={{ background: '#FDF6EC' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(196,117,110,0.08)' }}>
              <ShoppingBag className="w-10 h-10" style={{ color: '#C4756E' }} />
            </div>
            <h2 className="font-serif text-2xl font-medium mb-2" style={{ color: '#2a2220' }}>Your bag is empty</h2>
            <p className="text-sm mb-6" style={{ color: '#8a7e78' }}>Time to fill it with something cute!</p>
            <Link
              to="/products"
              className="btn-primary inline-flex items-center gap-2 arrow-nudge"
            >
              Browse Products <ArrowRight className="w-4 h-4 arrow-icon" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#FDF6EC' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <span className="section-label mb-1 block">Your bag</span>
            <h1 className="font-serif text-2xl font-medium" style={{ color: '#2a2220' }}>Shopping Cart</h1>
          </div>
          <button
            onClick={clearCart}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full transition-colors"
            style={{ color: '#C4756E', border: '1px solid rgba(196,117,110,0.2)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(196,117,110,0.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFDF9', boxShadow: '0 2px 12px -3px rgba(59,50,48,0.06)' }}>
              <div className="divide-y" style={{ borderColor: '#F0E0C6' }}>
                {items.map((item) => (
                  <CartItem key={`${item.product.id}::${item.variant?.id}`} item={item} />
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl p-6 sticky top-24" style={{ background: '#FFFDF9', boxShadow: '0 2px 12px -3px rgba(59,50,48,0.06)' }}>
              <h2 className="font-serif text-lg font-medium mb-5" style={{ color: '#2a2220' }}>Order Summary</h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm" style={{ color: '#6b5f58' }}>
                  <span>Subtotal</span>
                  <PriceDisplay regularPrice={total} />
                </div>
                <div className="flex justify-between text-sm" style={{ color: '#6b5f58' }}>
                  <span>Shipping</span>
                  {isFreeShipping ? (
                    <span className="font-medium" style={{ color: '#8BA88A' }}>Free ✨</span>
                  ) : (
                    <span>{CURRENCY_SYMBOL}{(SHIPPING_FEE / 100).toFixed(2)}</span>
                  )}
                </div>
                {!isFreeShipping && (
                  <p className="text-xs" style={{ color: '#8BA88A' }}>
                    Add {CURRENCY_SYMBOL}{((FREE_SHIPPING_THRESHOLD - total) / 100).toFixed(0)} more for free delivery
                  </p>
                )}
                <div className="pt-3 flex justify-between font-semibold text-base" style={{ borderTop: '1px solid #F0E0C6', color: '#2a2220' }}>
                  <span>Total</span>
                  <span style={{ color: '#C4756E' }}>{CURRENCY_SYMBOL}{(finalTotal / 100).toFixed(2)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="block w-full btn-primary text-center text-sm py-3 mb-3 arrow-nudge"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4 arrow-icon inline-block ml-1" />
              </Link>

              <Link
                to="/products"
                className="block w-full text-center text-xs font-medium py-2 transition-colors"
                style={{ color: '#8a7e78' }}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
