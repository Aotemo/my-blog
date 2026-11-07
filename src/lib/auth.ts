import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { COOKIE_NAME, SESSION_MAX_AGE } from "./constants";
import { signSessionToken, verifySessionToken, type SessionPayload } from "./jwt";
import prisma from "./prisma";

export type { SessionPayload };

export async function verifyCredentials(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return null;

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;

  return { id: user.id, username: user.username };
}

export async function createSessionCookie(userId: string, username: string) {
  const token = await signSessionToken({ userId, username }, SESSION_MAX_AGE);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySessionCookie() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireSession(): Promise<SessionPayload | null> {
  return getSession();
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}
