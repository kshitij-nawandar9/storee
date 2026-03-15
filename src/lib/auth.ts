import { validateJWT, type JWTClaims } from "./jwt";

export function getAuthFromRequest(request: Request): JWTClaims | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;

  try {
    return validateJWT(parts[1]);
  } catch {
    return null;
  }
}

export function requireAuth(request: Request): JWTClaims {
  const claims = getAuthFromRequest(request);
  if (!claims) throw new Error("Unauthorized");
  return claims;
}

export function requireAdmin(request: Request): JWTClaims {
  const claims = requireAuth(request);
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase());
  if (!adminEmails.includes(claims.email.toLowerCase())) {
    throw new Error("Forbidden");
  }
  return claims;
}
