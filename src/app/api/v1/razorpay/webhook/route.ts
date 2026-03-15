import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/helpers";

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-razorpay-signature");
    if (!signature) return Response.json({ error: "Missing signature" }, { status: 400 });

    const rawBody = await request.text();
    if (!verifyWebhookSignature(rawBody, signature)) {
      return Response.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event as string;
    const payment = event.payload?.payment?.entity || event.payload?.payment;
    const order = event.payload?.order?.entity || event.payload?.order;

    const razorpayOrderId = order?.id as string;
    const paymentId = payment?.id as string;
    const paymentStatus = payment?.status as string;

    if (!razorpayOrderId) return Response.json({ status: "success" }, { status: 200 });

    const dbOrder = await prisma.order.findFirst({ where: { razorpayOrderId } });
    if (!dbOrder) return Response.json({ status: "success" }, { status: 200 });

    switch (eventType) {
      case "payment.authorized":
      case "payment.captured":
        if (paymentStatus === "authorized" || paymentStatus === "captured") {
          await prisma.order.update({
            where: { id: dbOrder.id },
            data: { status: "paid", paymentId },
          });
        }
        break;
      case "payment.failed":
        await prisma.order.update({
          where: { id: dbOrder.id },
          data: { status: "cancelled", paymentId },
        });
        break;
    }

    return Response.json({ status: "success" }, { status: 200 });
  } catch {
    return Response.json({ status: "error" }, { status: 500 });
  }
}
