import { SignJWT, jwtVerify } from "jose";

export { COOKIE_NAME } from "./constants";

export type SessionPayload = {
  userId: string;
  username: string;
};

const EXAMPLE_SECRET = "change-me-to-a-long-random-secret";
const MIN_SECRET_LENGTH = 32;
const GENERATE_HINT = "请执行 `openssl rand -base64 48` 生成随机密钥";

/** 配置类错误需要向上抛出，不能被“无效 token”逻辑吞掉 */
export class JwtConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JwtConfigError";
  }
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? "";

  if (!secret) {
    throw new JwtConfigError(`缺少环境变量 JWT_SECRET，${GENERATE_HINT}`);
  }

  if (process.env.NODE_ENV === "production") {
    if (secret === EXAMPLE_SECRET) {
      throw new JwtConfigError(
        `JWT_SECRET 仍为 .env.example 中的示例值，生产环境拒绝签发与校验会话。${GENERATE_HINT}`,
      );
    }
    if (secret.length < MIN_SECRET_LENGTH) {
      throw new JwtConfigError(
        `JWT_SECRET 长度不足 ${MIN_SECRET_LENGTH} 位（当前 ${secret.length} 位），生产环境拒绝运行。${GENERATE_HINT}`,
      );
    }
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
  } catch (error) {
    if (error instanceof JwtConfigError) throw error;
    return null;
  }
}
