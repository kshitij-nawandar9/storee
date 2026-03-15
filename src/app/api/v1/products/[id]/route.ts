import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findFirst({
      where: { id, isActive: true, deletedAt: null },
      include: { images: true },
    });

    if (!product) return errorResponse("Product not found", 404);
    return successResponse(product, "Product fetched successfully");
  } catch (error) {
    return errorResponse("Failed to fetch product", 500, error);
  }
}
