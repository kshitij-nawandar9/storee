import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";
import { getRazorpayClient } from "@/lib/razorpay";
import { generateOrderId, successResponse, errorResponse } from "@/lib/helpers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, items, customer, address } = body;

    if (!amount || !items || !customer?.name || !customer?.email || !customer?.phone || !address?.line1) {
      return errorResponse("Invalid request data", 400);
    }

    const claims = getAuthFromRequest(request);

    let orderId = "";
    for (let i = 0; i < 5; i++) {
      orderId = generateOrderId();
      const existing = await prisma.order.findUnique({ where: { orderId } });
      if (!existing) break;
      if (i === 4) return errorResponse("Failed to generate unique order ID", 500);
    }

    const razorpayClient = getRazorpayClient();
    const receipt = `receipt_${orderId}`;
    const razorpayOrder = await razorpayClient.createOrder(amount, receipt);

    const order = await prisma.order.create({
      data: {
        orderId,
        razorpayOrderId: razorpayOrder.id,
        userId: claims?.userId || null,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        address,
        items,
        totalAmount: amount,
        status: "pending",
        paymentMethod: "razorpay",
      },
    });

    return successResponse(
      {
        order: {
          id: order.id,
          order_id: orderId,
          razorpay_id: razorpayOrder.id,
          amount: order.totalAmount,
          currency: "INR",
          key_id: process.env.RAZORPAY_KEY_ID,
        },
      },
      "Order created successfully",
      201
    );
  } catch (error) {
    return errorResponse("Failed to create order", 500, error);
  }
}
