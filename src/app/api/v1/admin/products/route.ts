import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/helpers";

export async function GET(request: Request) {
  try {
    requireAdmin(request);
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const isActive = searchParams.get("isActive");

    const where: Record<string, unknown> = { deletedAt: null };
    if (category) where.category = category;
    if (isActive === "true") where.isActive = true;
    else if (isActive === "false") where.isActive = false;

    const products = await prisma.product.findMany({
      where,
      include: { images: true },
      orderBy: { createdAt: "desc" },
    });
    return successResponse(products, "Products fetched successfully");
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return errorResponse("Authorization required", 401);
    if (error instanceof Error && error.message === "Forbidden") return errorResponse("Admin access required", 403);
    return errorResponse("Failed to fetch products", 500, error);
  }
}

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  try {
    requireAdmin(request);
    const body = await request.json();
    const { name, slug: rawSlug, description, basePrice, category, stock, isActive, features, images } = body;

    if (!name || !basePrice || !category) return errorResponse("Invalid request data", 400);

    const slug = rawSlug || generateSlug(name);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) return errorResponse("Product with this slug already exists", 409);

    const product = await prisma.product.create({
      data: {
        name, slug, description, basePrice, category, stock, isActive: isActive ?? true, features: features || [],
        images: images?.length ? {
          create: images.map((img: { url: string; altText?: string; order?: number; isPrimary?: boolean }) => ({
            url: img.url, altText: img.altText || null, order: img.order || 0, isPrimary: img.isPrimary || false,
          })),
        } : undefined,
      },
      include: { images: true },
    });

    return successResponse(product, "Product created successfully", 201);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return errorResponse("Authorization required", 401);
    if (error instanceof Error && error.message === "Forbidden") return errorResponse("Admin access required", 403);
    return errorResponse("Failed to create product", 500, error);
  }
}
