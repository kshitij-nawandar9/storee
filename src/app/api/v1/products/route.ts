import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: Record<string, unknown> = { isActive: true, deletedAt: null };
    if (category) where.category = category;

    const products = await prisma.product.findMany({
      where,
      include: { images: true },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(products, "Products fetched successfully");
  } catch (error) {
    return errorResponse("Failed to fetch products", 500, error);
  }
}
