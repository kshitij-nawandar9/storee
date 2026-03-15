import type { RazorpayPaymentResponse } from "@/types";

const RAZORPAY_KEY_ID =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    : undefined;

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as unknown as Record<string, unknown>).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initializeRazorpayCheckout = (
  orderId: string,
  amount: number,
  keyId: string | undefined,
  customerDetails: { name: string; email: string; contact: string },
  onSuccess: (response: RazorpayPaymentResponse) => void,
  onError: (error: string) => void
) => {
  const razorpayKey = keyId || RAZORPAY_KEY_ID;

  if (!razorpayKey) {
    onError("Razorpay key not configured. Please contact support.");
    return;
  }

  const win = window as unknown as Record<string, unknown>;
  if (!win.Razorpay) {
    onError("Razorpay script not loaded. Please refresh the page.");
    return;
  }

  let formattedContact = customerDetails.contact.trim();
  if (!formattedContact.startsWith("+")) {
    formattedContact = formattedContact.replace(/^0+/, "");
    if (formattedContact.length === 10) {
      formattedContact = "+91" + formattedContact;
    } else {
      formattedContact = "+" + formattedContact;
    }
  }

  const options = {
    key: razorpayKey,
    amount,
    currency: "INR",
    name: "Storee",
    description: "Order Payment",
    order_id: orderId,
    handler: function (response: RazorpayPaymentResponse) {
      onSuccess(response);
    },
    prefill: {
      name: customerDetails.name,
      email: customerDetails.email,
      contact: formattedContact,
    },
    theme: { color: "#2563eb" },
    modal: {
      ondismiss: function () {
        onError("Payment cancelled by user");
      },
    },
    notes: { order_id: orderId },
    retry: { enabled: true, max_count: 3 },
  };

  try {
    const RazorpayClass = win.Razorpay as new (opts: unknown) => {
      on: (event: string, cb: (resp: unknown) => void) => void;
      open: () => void;
    };
    const razorpayInstance = new RazorpayClass(options);
    razorpayInstance.on("payment.failed", function (response: unknown) {
      const resp = response as Record<string, Record<string, string>>;
      onError(
        `Payment failed: ${resp.error?.description || "Unknown error"}`
      );
    });
    razorpayInstance.open();
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    onError(`Failed to initialize payment: ${msg}`);
  }
};
