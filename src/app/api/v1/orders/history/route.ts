import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/helpers";

export async function GET(request: Request) {
  try {
    const claims = requireAuth(request);
    const orders = await prisma.order.findMany({
      where: { userId: claims.userId },
      orderBy: { createdAt: "desc" },
    });
    return successResponse(orders, "Orders retrieved successfully");
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return errorResponse("User not authenticated", 401);
    }
    return errorResponse("Failed to fetch orders", 500, error);
  }
}
