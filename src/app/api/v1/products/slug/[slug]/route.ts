import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const product = await prisma.product.findFirst({
      where: { slug, isActive: true, deletedAt: null },
      include: { images: true },
    });

    if (!product) return errorResponse("Product not found", 404);
    return successResponse(product, "Product fetched successfully");
  } catch (error) {
    return errorResponse("Failed to fetch product", 500, error);
  }
}
