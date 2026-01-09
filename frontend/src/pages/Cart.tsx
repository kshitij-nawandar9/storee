import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import CartItem from '@/components/cart/CartItem';
import PriceDisplay from '@/components/product/PriceDisplay';
import { CURRENCY_SYMBOL } from '@/utils/constants';
import { ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';

export default function Cart() {
  const { items, getTotal, clearCart } = useCart();
  const total = getTotal();
  const shippingCost = 0; // Free shipping
  const finalTotal = total + shippingCost;

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-16 h-16 text-primary-600" />
            </div>
            <h2 className="text-3xl font-bold mb-3 text-gray-900">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 text-lg">Start shopping to add items to your cart</p>
            <Link
              to="/products"
              className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2 group"
            >
              Browse Products
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gradient">Shopping Cart</h1>
          <button
            onClick={clearCart}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="card divide-y divide-gray-200">
              {items.map((item) => (
                <CartItem key={item.product.id} item={item} />
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <PriceDisplay regularPrice={total} />
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="text-green-600 font-semibold">Free</span>
                </div>
                <div className="border-t-2 border-gray-200 pt-4 flex justify-between font-bold text-xl text-gray-900">
                  <span>Total</span>
                  <span className="text-primary-600">{CURRENCY_SYMBOL}{(finalTotal / 100).toFixed(2)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="block w-full btn-primary text-center text-lg py-4 mb-4"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5 inline-block ml-2" />
              </Link>

              <Link
                to="/products"
                className="block w-full text-center text-primary-600 hover:text-primary-700 font-medium py-2 transition-colors"
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
