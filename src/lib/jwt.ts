import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface JWTClaims {
  userId: string;
  email: string;
}

export function generateJWT(userId: string, email: string): string {
  return jwt.sign({ userId, email, iss: "storee" }, JWT_SECRET, { expiresIn: "7d" });
}

export function validateJWT(token: string): JWTClaims {
  const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & JWTClaims;
  return { userId: decoded.userId, email: decoded.email };
}
