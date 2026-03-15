import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/helpers";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(request);
    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderId: id }] },
    });
    if (!order) return errorResponse("Order not found", 404);

    if (order.status !== "pending" && order.status !== "paid") {
      return errorResponse(`Cannot approve order with status: ${order.status}`, 400);
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: "approved" },
    });

    return successResponse(updated, "Order approved successfully");
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return errorResponse("Authorization required", 401);
    if (error instanceof Error && error.message === "Forbidden") return errorResponse("Admin access required", 403);
    return errorResponse("Failed to approve order", 500, error);
  }
}
