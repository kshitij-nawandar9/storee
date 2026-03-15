import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/helpers";

export async function GET(request: Request) {
  try {
    requireAdmin(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const paymentMethod = searchParams.get("paymentMethod");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, skip: offset, take: limit }),
      prisma.order.count({ where }),
    ]);

    return successResponse(
      { orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
      "Orders fetched successfully"
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return errorResponse("Authorization required", 401);
    if (error instanceof Error && error.message === "Forbidden") return errorResponse("Admin access required", 403);
    return errorResponse("Failed to fetch orders", 500, error);
  }
}
