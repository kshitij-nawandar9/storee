import crypto from "crypto";

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function generateOrderId(): string {
  const bytes = crypto.randomBytes(10);
  return Array.from(bytes)
    .map((b) => CHARSET[b % CHARSET.length])
    .join("");
}

export function successResponse(data: unknown, message: string, status = 200) {
  return Response.json({ success: true, message, data }, { status });
}

export function errorResponse(message: string, status: number, error?: unknown) {
  const data = error instanceof Error ? { error: error.message } : error ? { error: String(error) } : null;
  return Response.json({ success: false, message, data }, { status });
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  const message = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(message).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
