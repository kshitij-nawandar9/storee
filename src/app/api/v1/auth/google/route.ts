import { prisma } from "@/lib/prisma";
import { generateJWT } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/lib/helpers";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    if (!token) return errorResponse("Invalid request", 400);

    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    if (!googleRes.ok) return errorResponse("Invalid Google token", 401);

    const tokenInfo = await googleRes.json();
    const googleId = tokenInfo.sub as string;
    const email = tokenInfo.email as string;
    const name = (tokenInfo.name as string) || "";
    const picture = (tokenInfo.picture as string) || "";
    const emailVerified = tokenInfo.email_verified === "true" || tokenInfo.email_verified === true;

    if (!email) return errorResponse("Email not found in token", 401);

    let user = await prisma.user.findUnique({ where: { googleId } });

    if (!user) {
      user = await prisma.user.create({
        data: { googleId, email, name, picture, emailVerified },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name, picture, emailVerified },
      });
    }

    const jwtToken = generateJWT(user.id, user.email);

    return successResponse(
      {
        token: jwtToken,
        user: { id: user.id, email: user.email, name: user.name, picture: user.picture },
      },
      "Login successful"
    );
  } catch (error) {
    return errorResponse("Login failed", 500, error);
  }
}
