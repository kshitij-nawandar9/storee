import type { RazorpayPaymentResponse } from '@/types';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if script is already loaded
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initializeRazorpayCheckout = (
  orderId: string,
  amount: number,
  customerDetails: {
    name: string;
    email: string;
    contact: string;
  },
  onSuccess: (response: RazorpayPaymentResponse) => void,
  onError: (error: string) => void
) => {
  if (!RAZORPAY_KEY_ID) {
    onError('Razorpay key not configured');
    return;
  }

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: amount, // amount in paise
    currency: 'INR',
    name: 'Storee',
    description: 'Order Payment',
    order_id: orderId,
    handler: function (response: RazorpayPaymentResponse) {
      onSuccess(response);
    },
    prefill: {
      name: customerDetails.name,
      email: customerDetails.email,
      contact: customerDetails.contact,
    },
    theme: {
      color: '#2563eb',
    },
    modal: {
      ondismiss: function () {
        onError('Payment cancelled');
      },
    },
  };

  const razorpayInstance = new (window as any).Razorpay(options);
  razorpayInstance.open();
};
