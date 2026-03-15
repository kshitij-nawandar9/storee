import { prisma } from "@/lib/prisma";
import { verifyRazorpaySignature, successResponse, errorResponse } from "@/lib/helpers";

export async function POST(request: Request) {
  try {
    const { order_id, payment_id, signature } = await request.json();
    if (!order_id || !payment_id || !signature) return errorResponse("Invalid request data", 400);

    if (!verifyRazorpaySignature(order_id, payment_id, signature)) {
      return errorResponse("Invalid payment signature", 400);
    }

    const order = await prisma.order.findFirst({ where: { razorpayOrderId: order_id } });
    if (!order) return errorResponse("Order not found", 404);

    await prisma.order.update({
      where: { id: order.id },
      data: { status: "paid", paymentId: payment_id },
    });

    return successResponse({ paymentId: payment_id, orderId: order.orderId }, "Payment verified successfully");
  } catch (error) {
    return errorResponse("Failed to verify payment", 500, error);
  }
}
