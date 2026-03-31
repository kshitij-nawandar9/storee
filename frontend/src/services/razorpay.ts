import type { RazorpayPaymentResponse } from '@/types';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if script is already loaded
    if ((window as any).Razorpay) {
      console.log('[Razorpay] Script already loaded');
      resolve(true);
      return;
    }

    console.log('[Razorpay] Loading script from checkout.razorpay.com...');
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => { console.log('[Razorpay] Script loaded successfully'); resolve(true); };
    script.onerror = (e) => { console.error('[Razorpay] Script failed to load — possible ad blocker or network issue', e); resolve(false); };
    document.body.appendChild(script);
  });
};

export const initializeRazorpayCheckout = (
  orderId: string,
  amount: number,
  keyId: string | undefined,
  customerDetails: {
    name: string;
    email: string;
    contact: string;
  },
  onSuccess: (response: RazorpayPaymentResponse) => void,
  onError: (error: string) => void
) => {
  // Use key from backend response, fallback to env variable
  const razorpayKey = keyId || RAZORPAY_KEY_ID;
  
  if (!razorpayKey) {
    console.error('[Razorpay] No key configured. keyId from backend:', keyId, 'env VITE_RAZORPAY_KEY_ID:', RAZORPAY_KEY_ID);
    onError('Razorpay key not configured. Please contact support.');
    return;
  }

  if (!(window as any).Razorpay) {
    console.error('[Razorpay] Razorpay constructor not available on window — script not loaded');
    onError('Razorpay script not loaded. Please refresh the page.');
    return;
  }

  console.log('[Razorpay] Initializing checkout...', { orderId, amount, keyPrefix: razorpayKey.substring(0, 8) + '...' });

  // Format contact number: ensure it starts with + and country code
  // If it doesn't start with +, assume it's an Indian number (+91)
  let formattedContact = customerDetails.contact.trim();
  if (!formattedContact.startsWith('+')) {
    // Remove any leading zeros or spaces
    formattedContact = formattedContact.replace(/^0+/, '');
    // Add +91 for Indian numbers if not already present
    if (formattedContact.length === 10) {
      formattedContact = '+91' + formattedContact;
    } else {
      formattedContact = '+' + formattedContact;
    }
  }

  const options = {
    key: razorpayKey,
    amount: amount, // amount in paise (currency subunits)
    currency: 'INR',
    name: 'Storee',
    description: 'Order Payment',
    order_id: orderId, // Razorpay order ID from server
    handler: function (response: RazorpayPaymentResponse) {
      onSuccess(response);
    },
    prefill: {
      name: customerDetails.name,
      email: customerDetails.email,
      contact: formattedContact, // Format: +{country code}{phone number}
    },
    theme: {
      color: '#2563eb',
    },
    modal: {
      ondismiss: function () {
        onError('Payment cancelled by user');
      },
    },
    notes: {
      order_id: orderId,
    },
    retry: {
      enabled: true,
      max_count: 3,
    },
  };

  try {
    const razorpayInstance = new (window as any).Razorpay(options);
    razorpayInstance.on('payment.failed', function (response: any) {
      console.error('[Razorpay] Payment failed:', { code: response.error?.code, description: response.error?.description, reason: response.error?.reason, orderId: response.error?.metadata?.order_id });
      onError(`Payment failed: ${response.error.description || 'Unknown error'}`);
    });
    console.log('[Razorpay] Opening checkout modal');
    razorpayInstance.open();
  } catch (error: any) {
    console.error('[Razorpay] Failed to initialize:', error);
    onError(`Failed to initialize payment: ${error.message || 'Unknown error'}`);
  }
};
