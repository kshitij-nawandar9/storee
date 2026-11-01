import PriceDisplay from '@/components/product/PriceDisplay';
import { useCart } from '@/hooks/useCart';
import { trackEvent } from '@/services/analytics';
import { createIdempotencyKey, createRazorpayOrder, verifyPayment } from '@/services/api';
import { initializeRazorpayCheckout, loadRazorpayScript } from '@/services/razorpay';
import type { Address } from '@/types';
import { CURRENCY_SYMBOL, FREE_SHIPPING_MESSAGE, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, getSalePrice } from '@/utils/constants';
import { buildCheckoutOrderItems } from '@/utils/orderItems';
import { getSavedAddresses, getDefaultAddress, saveAddress, type SavedAddress } from '@/utils/savedAddresses';
import { ArrowRight, CreditCard, Lock, ShoppingBag, Truck, Save, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { imageAtWidth } from '@/utils/images';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    address: Address;
  }>({
    name: '',
    email: '',
    phone: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
    },
  });
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState<string>('');
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [showSaveOption, setShowSaveOption] = useState(false);
  const [addressLabel, setAddressLabel] = useState('');
  const [emailError, setEmailError] = useState('');
  const orderIdempotencyRef = useRef<{ key: string; fingerprint: string } | null>(null);
  const submittingRef = useRef(false);
  const checkoutTrackedRef = useRef(false);

  const total = getTotal();
  const isFreeShipping = total >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = isFreeShipping ? 0 : SHIPPING_FEE;
  const finalTotal = total + shippingCost;

  useEffect(() => {
    if (items.length > 0 && !checkoutTrackedRef.current) {
      checkoutTrackedRef.current = true;
      trackEvent('checkout_started', {
        value: finalTotal / 100,
        currency: 'INR',
        item_count: items.reduce((count, item) => count + item.quantity, 0),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load saved addresses on mount
  useEffect(() => {
    const addresses = getSavedAddresses();
    setSavedAddresses(addresses);
    
    // Load default address if available
    const defaultAddr = getDefaultAddress();
    if (defaultAddr) {
      setFormData({
        name: defaultAddr.name,
        email: defaultAddr.email,
        phone: defaultAddr.phone,
        address: defaultAddr.address,
      });
      setSelectedSavedAddress(defaultAddr.id);
      setShowSaveOption(false);
    }
  }, []);

  const loadSavedAddress = (addressId: string) => {
    const addresses = getSavedAddresses();
    const address = addresses.find(addr => addr.id === addressId);
    if (address) {
      setFormData({
        name: address.name,
        email: address.email,
        phone: address.phone,
        address: address.address,
      });
      setSelectedSavedAddress(addressId);
      setShowSaveOption(false);
      toast.success('Address loaded');
    }
  };

  const handleSaveAddress = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.address.line1) {
      toast.error('Please fill in all required fields before saving');
      return;
    }

    const newAddress = saveAddress({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      isDefault: saveAsDefault,
      label: addressLabel || undefined,
    });

    setSavedAddresses(getSavedAddresses());
    setSelectedSavedAddress(newAddress.id);
    setShowSaveOption(false);
    setAddressLabel('');
    toast.success('Address saved successfully!');
  };

  const handleUseNewAddress = () => {
    setSelectedSavedAddress('');
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
      },
    });
    setShowSaveOption(true);
  };

  const validateEmail = (email: string): string => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    if (email.length > 254) return 'Email address is too long';
    const [localPart] = email.split('@');
    if (localPart.length > 64) return 'Email username is too long';
    return '';
  };

  const handleEmailChange = (email: string) => {
    setFormData({ ...formData, email });
    if (emailError) setEmailError(validateEmail(email));
  };

  const handleEmailBlur = () => {
    setEmailError(validateEmail(formData.email));
  };

  const getOrderIdempotencyKey = (fingerprint: string) => {
    if (!orderIdempotencyRef.current || orderIdempotencyRef.current.fingerprint !== fingerprint) {
      orderIdempotencyRef.current = {
        key: createIdempotencyKey(),
        fingerprint,
      };
    }
    return orderIdempotencyRef.current.key;
  };

  const finishCheckoutAttempt = () => {
    submittingRef.current = false;
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submittingRef.current) {
      return;
    }

    const emailErr = validateEmail(formData.email);
    if (emailErr) {
      setEmailError(emailErr);
      toast.error(emailErr);
      return;
    }

    submittingRef.current = true;
    setLoading(true);

    // Save address if user wants to save it
    if (saveAsDefault && !selectedSavedAddress) {
      try {
        saveAddress({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          isDefault: saveAsDefault,
          label: addressLabel || undefined,
        });
        setSavedAddresses(getSavedAddresses());
      } catch (error) {
        console.error('[Checkout] Failed to save address to localStorage:', error);
      }
    }

    try {
      // Step 1: Load Razorpay SDK
      console.log('[Checkout] Step 1: Loading Razorpay script...');
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        console.error('[Checkout] Step 1 FAILED: Razorpay script did not load');
        toast.error('Failed to load payment gateway. Please disable ad blockers and try again.');
        finishCheckoutAttempt();
        return;
      }
      console.log('[Checkout] Step 1: Razorpay script loaded');

      // Step 2: Create order on backend
      const orderItems = buildCheckoutOrderItems(items);
      console.log('[Checkout] Step 2: Creating order...', { amount: finalTotal, itemCount: orderItems.length });
      const orderPayload = {
        amount: finalTotal,
        items: orderItems,
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
        address: formData.address,
      };
      const idempotencyKey = getOrderIdempotencyKey(JSON.stringify(orderPayload));
      const orderResponse = await createRazorpayOrder(orderPayload, idempotencyKey);

      if (!orderResponse.success) {
        console.error('[Checkout] Step 2 FAILED: Order creation failed', orderResponse);
        toast.error(orderResponse.message || 'Failed to create order');
        finishCheckoutAttempt();
        return;
      }

      const { order } = orderResponse.data;
      console.log('[Checkout] Step 2: Order created', { orderId: order.order_id, razorpayId: order.razorpay_id });
      trackEvent('payment_initiated', {
        order_id: order.order_id,
        value: finalTotal / 100,
        currency: 'INR',
      });

      // Step 3: Open Razorpay checkout
      console.log('[Checkout] Step 3: Initializing Razorpay checkout...');
      initializeRazorpayCheckout(
        order.razorpay_id,
        order.amount,
        order.key_id,
        {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        async (razorpayResponse) => {
          // Step 4: Verify payment
          try {
            console.log('[Checkout] Step 4: Verifying payment...', { paymentId: razorpayResponse.razorpay_payment_id });
            const verifyResponse = await verifyPayment({
              order_id: order.razorpay_id,
              payment_id: razorpayResponse.razorpay_payment_id,
              signature: razorpayResponse.razorpay_signature,
            });

            if (verifyResponse.success) {
              console.log('[Checkout] Step 4: Payment verified successfully');
              const orderId = verifyResponse.data?.orderId || order.order_id || order.id;
              trackEvent('order_completed', {
                order_id: orderId,
                value: finalTotal / 100,
                currency: 'INR',
                item_count: items.reduce((count, item) => count + item.quantity, 0),
              });
              toast.success('Order placed successfully!');
              clearCart();
              orderIdempotencyRef.current = null;
              navigate(`/orders/${orderId}`);
            } else {
              console.error('[Checkout] Step 4 FAILED: Verification response not successful', verifyResponse);
              trackEvent('payment_failed', { order_id: order.order_id, reason: verifyResponse.message || 'verification failed' });
              toast.error(verifyResponse.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('[Checkout] Step 4 FAILED: Payment verification error:', error);
            trackEvent('payment_failed', { order_id: order.order_id, reason: 'verification error' });
            toast.error('Payment verification failed. Please contact support if money was deducted.');
          } finally {
            finishCheckoutAttempt();
          }
        },
        (error) => {
          console.error('[Checkout] Step 3 FAILED: Razorpay checkout error:', error);
          trackEvent('payment_failed', { order_id: order.order_id, reason: error });
          toast.error(error);
          finishCheckoutAttempt();
        }
      );
    } catch (error) {
      console.error('[Checkout] Unexpected error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Checkout] Error details:', message);
      toast.error('Something went wrong. Please try again.');
      finishCheckoutAttempt();
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-20 bg-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-16 h-16 text-primary-600" />
            </div>
            <h2 className="text-3xl font-bold mb-3 text-gray-900">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 text-lg">Add items to your cart to checkout</p>
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
    <div className="min-h-screen py-12 bg-warm-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-gradient">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="card p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shadow-sm">
                    <Truck className="w-5 h-5 text-primary-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Shipping Address</h2>
                </div>
                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={handleUseNewAddress}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Use New Address
                  </button>
                )}
              </div>

              {/* Saved Addresses Dropdown */}
              {savedAddresses.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Select from Saved Addresses
                  </label>
                  <select
                    value={selectedSavedAddress}
                    onChange={(e) => {
                      if (e.target.value) {
                        loadSavedAddress(e.target.value);
                      } else {
                        handleUseNewAddress();
                      }
                    }}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                  >
                    <option value="">Select a saved address...</option>
                    {savedAddresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.label ? `${addr.label} - ` : ''}
                        {addr.name} ({addr.address.city}, {addr.address.state})
                        {addr.isDefault ? ' (Default)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onBlur={handleEmailBlur}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all bg-white ${
                      emailError
                        ? 'border-red-400 focus:ring-red-300 focus:border-red-400'
                        : 'border-orange-200 focus:ring-primary-500 focus:border-primary-500'
                    }`}
                    placeholder="your@email.com"
                  />
                  {emailError && (
                    <p className="mt-1 text-sm text-red-500">{emailError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Phone *</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                    placeholder="10-digit number"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Address Line 1 *</label>
                  <input
                    type="text"
                    required
                    value={formData.address.line1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, line1: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                    placeholder="Street address"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Address Line 2</label>
                  <input
                    type="text"
                    value={formData.address.line2}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, line2: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                    placeholder="Apartment, suite, etc. (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.address.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.address.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, state: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Pincode *</label>
                  <input
                    type="text"
                    required
                    pattern="[0-9]{6}"
                    value={formData.address.pincode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, pincode: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                    placeholder="6-digit pincode"
                  />
                </div>
              </div>

              {/* Save Address Option */}
              {showSaveOption || (!selectedSavedAddress && savedAddresses.length === 0) ? (
                <div className="mt-6 p-4 bg-warm-100 rounded-xl border border-orange-200">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="saveAddress"
                      checked={saveAsDefault}
                      onChange={(e) => setSaveAsDefault(e.target.checked)}
                      className="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="flex-1">
                      <label htmlFor="saveAddress" className="block text-sm font-medium text-gray-700 mb-2">
                        Save this address for future orders
                      </label>
                      {saveAsDefault && (
                        <div className="mt-2">
                          <input
                            type="text"
                            value={addressLabel}
                            onChange={(e) => setAddressLabel(e.target.value)}
                            placeholder="Label (e.g., Home, Work, Office)"
                            className="w-full px-3 py-2 border border-orange-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  {saveAsDefault && (
                    <button
                      type="button"
                      onClick={handleSaveAddress}
                      className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors flex items-center gap-2 text-sm shadow-warm"
                    >
                      <Save className="w-4 h-4" />
                      Save Address
                    </button>
                  )}
                </div>
              ) : selectedSavedAddress && (
                <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-700">
                    <Check className="w-5 h-5" />
                    <span className="text-sm font-medium">Using saved address</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSaveOption(true);
                      setSaveAsDefault(false);
                    }}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Edit & Save
                  </button>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shadow-sm">
                  <CreditCard className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
              </div>
              <div className="flex items-start p-5 border-2 border-primary-500 bg-primary-50 rounded-xl">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="w-5 h-5 text-primary-600" />
                    <div className="font-bold text-gray-900">Online Payment</div>
                  </div>
                  <div className="text-sm text-gray-600 ml-8">
                    Credit/Debit Card, UPI, Net Banking, Wallets
                  </div>
                </div>
                <Lock className="w-5 h-5 text-gray-400 ml-2" />
              </div>

              {/* Free Delivery Banner */}
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-3 text-green-700">
                  <Truck className="w-5 h-5" />
                  <span className="font-semibold">{FREE_SHIPPING_MESSAGE}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                {items.map((item) => {
                  const unitPrice = item.variant?.price ?? item.product.basePrice;
                  const linePrice = unitPrice * item.quantity;
                  const saleLinePrice = getSalePrice(unitPrice, item.product);
                  const variantImage = item.variant?.image;
                  const primaryImage =
                    item.product.images?.find((img) => img.isPrimary) ||
                    item.product.images?.[0];
                  const imageSrc = variantImage || primaryImage?.url || '/placeholder.jpg';
                  return (
                    <div key={`${item.product.id}-${item.variant?.id || ''}`} className="flex gap-3">
                      <img
                        src={imageAtWidth(imageSrc, 200)}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-xl border border-orange-200"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{item.product.name}</p>
                        <p className="text-gray-600 text-sm">× {item.quantity}</p>
                        <PriceDisplay regularPrice={linePrice} salePrice={saleLinePrice ? saleLinePrice * item.quantity : undefined} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t-2 border-gray-200 pt-6 space-y-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <PriceDisplay regularPrice={total} />
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  {isFreeShipping ? (
                    <span className="text-green-600 font-semibold">Free</span>
                  ) : (
                    <span>{CURRENCY_SYMBOL}{(SHIPPING_FEE / 100).toFixed(2)}</span>
                  )}
                </div>
                <div className="border-t-2 border-gray-200 pt-4 flex justify-between font-bold text-xl text-gray-900">
                  <span>Total</span>
                  <span className="text-primary-600">{CURRENCY_SYMBOL}{(finalTotal / 100).toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 btn-primary text-lg py-4 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Payment
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
