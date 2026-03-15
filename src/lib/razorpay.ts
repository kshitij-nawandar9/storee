interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export class RazorpayClient {
  private keyId: string;
  private keySecret: string;
  private baseUrl = "https://api.razorpay.com/v1";

  constructor(keyId: string, keySecret: string) {
    this.keyId = keyId;
    this.keySecret = keySecret;
  }

  async createOrder(amount: number, receipt: string): Promise<RazorpayOrderResponse> {
    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64");
    
    const response = await fetch(`${this.baseUrl}/orders`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount, currency: "INR", receipt }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Razorpay API error: ${body} (status: ${response.status})`);
    }

    return response.json();
  }
}

export function getRazorpayClient(): RazorpayClient {
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  return new RazorpayClient(keyId, keySecret);
}
