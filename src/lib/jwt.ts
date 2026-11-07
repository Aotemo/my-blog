import { SignJWT, jwtVerify } from "jose";

export { COOKIE_NAME } from "./constants";

export type SessionPayload = {
  userId: string;
  username: string;
};

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("缺少环境变量 JWT_SECRET");
  }
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(payload: SessionPayload, maxAgeSeconds: number): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAgeSeconds)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.userId !== "string" || typeof payload.username !== "string") {
      return null;
    }
    return { userId: payload.userId, username: payload.username };
  } catch {
    return null;
  }
}
