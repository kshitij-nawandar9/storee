import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/helpers";

export async function GET(request: Request) {
  try {
    const claims = requireAuth(request);
    const user = await prisma.user.findUnique({ where: { id: claims.userId } });
    if (!user) return errorResponse("User not found", 404);

    return successResponse(
      { id: user.id, email: user.email, name: user.name, picture: user.picture },
      "User retrieved successfully"
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return errorResponse("User not authenticated", 401);
    }
    return errorResponse("Failed to get user", 500, error);
  }
}
