import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/helpers";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(request);
    const { id } = await params;
    const body = await request.json();

    const product = await prisma.product.findFirst({ where: { id, deletedAt: null } });
    if (!product) return errorResponse("Product not found", 404);

    if (body.slug && body.slug !== product.slug) {
      const existing = await prisma.product.findFirst({ where: { slug: body.slug, id: { not: id } } });
      if (existing) return errorResponse("Product with this slug already exists", 409);
    }

    const updateData: Record<string, unknown> = {};
    if (body.name) updateData.name = body.name;
    if (body.slug) updateData.slug = body.slug;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.basePrice !== undefined) updateData.basePrice = body.basePrice;
    if (body.category) updateData.category = body.category;
    if (body.stock !== undefined) updateData.stock = body.stock;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.features !== undefined) updateData.features = body.features;

    if (body.images !== undefined) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      if (body.images.length > 0) {
        await prisma.productImage.createMany({
          data: body.images.map((img: { url: string; altText?: string; order?: number; isPrimary?: boolean }) => ({
            productId: id, url: img.url, altText: img.altText || null, order: img.order || 0, isPrimary: img.isPrimary || false,
          })),
        });
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { images: true },
    });

    return successResponse(updated, "Product updated successfully");
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return errorResponse("Authorization required", 401);
    if (error instanceof Error && error.message === "Forbidden") return errorResponse("Admin access required", 403);
    return errorResponse("Failed to update product", 500, error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(request);
    const { id } = await params;

    const product = await prisma.product.findFirst({ where: { id, deletedAt: null } });
    if (!product) return errorResponse("Product not found", 404);

    await prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });
    return successResponse(null, "Product deleted successfully");
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return errorResponse("Authorization required", 401);
    if (error instanceof Error && error.message === "Forbidden") return errorResponse("Admin access required", 403);
    return errorResponse("Failed to delete product", 500, error);
  }
}
